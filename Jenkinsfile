node {
  checkout scm
  result = sh(script: "git log -1 | grep '(wip)'", returnStatus: true)

  if (result == 0) {
    echo "Skipping commit"
  } else {
    script {
      IMAGE_BACKEND = sh(returnStdout: true, script: "cd gmus-backend && make get_image").trim()
      IMAGE_WEB = sh(returnStdout: true, script: "cd gmus-web && make get_image").trim()
      IMAGE_MOBILE = sh(returnStdout: true, script: "cd gmus-mobile && make get_image").trim()
    }

    stage('Build and push images') {
      script {
        docker.withRegistry('https://docker.fela.space', 'docker.fela.space-registry') {
          sh 'REACT_APP_API_URL=//gmus.fela.space/api make build.docker push'
        }
      }
    }

    docker.withRegistry('https://docker.fela.space', 'docker.fela.space-registry') {
      docker.image('postgres:10-alpine').withRun('-e POSTGRES_USER=docker -e POSTGRES_PASSWORD=docker') { pg ->

        docker.image('postgres:10-alpine').inside("--link ${pg.id}:db") {
          sh 'while ! psql postgres://docker:docker@db/postgres -c "select 1" > /dev/null 2>&1; do sleep 1; done'

          sh 'psql postgres://docker:docker@db/postgres -c "create database music_player_test;"'
        }

        docker.image('redis:6-alpine').withRun('') { redis ->

          stage('Lint') {
            parallel([
              "gmus-web:lint": {
                sh "docker run -e 'CI=1' --rm docker.fela.space/gmus-web-builder:latest sh -c 'make lint'"
              },
              "gmus-backend:lint": {
                sh "docker run --rm ${IMAGE_BACKEND} sh -c 'make lint'"
              }
            ])
          }

          stage('Test') {
            parallel([
              "gmus-web:unit tests": {
                sh "docker run --rm -e 'CI=1' -e 'REACT_APP_API_URL=http://my-api.url:1234' docker.fela.space/gmus-web-builder:latest sh -c 'make test'"
              },
              "gmus-mobile:unit tests": {
                sh "docker run --rm ${IMAGE_MOBILE} sh -c 'flutter analyze && flutter test'"
              },
              "gmus-backend:tests": {
                sh "docker run --rm --link ${pg.id}:db --link ${redis.id}:redis ${IMAGE_BACKEND} sh -c 'make test.ci'"
              }
            ])
          }
        }
      }
    }

    stage('Deploy') {
      if (env.BRANCH_NAME == "master") {
        sh 'LIBRARY_DIRECTORY=$GMUS_LIBRARY_DIRECTORY ./k8s/deploy.sh'
      }
    }
  }
}
