import { getNextActiveArtistAndAlbum, getScrollIndex } from './scroll';

describe(getNextActiveArtistAndAlbum.name, () => {
  const artists: string[] = ['A', 'B', 'C'];

  const artistAlbums: Record<string, string[]> = {
    A: ['a1', 'a2', 'a3'],
    C: ['c1', 'c2'],
  };

  describe('scrolling down', () => {
    describe('when nothing is active', () => {
      it('switch to the first artist', () => {
        expect.assertions(1);
        expect(getNextActiveArtistAndAlbum(artists, artistAlbums, null, null, [], 1)).toStrictEqual(
          {
            artist: 'A',
            album: null,
          },
        );
      });
    });

    describe('when the first artist is active', () => {
      describe('when its albums are not expanded', () => {
        it('should switch to the second artist', () => {
          expect.assertions(1);
          expect(
            getNextActiveArtistAndAlbum(artists, artistAlbums, 'A', null, [], 1),
          ).toStrictEqual({
            artist: 'B',
            album: null,
          });
        });
      });

      describe('when its albums are expanded', () => {
        it('should switch to the first album', () => {
          expect.assertions(1);
          expect(
            getNextActiveArtistAndAlbum(artists, artistAlbums, 'A', null, ['A'], 1),
          ).toStrictEqual({
            artist: 'A',
            album: 'a1',
          });
        });
      });
    });

    describe('when the last artist is active', () => {
      describe('when its albums are expanded', () => {
        it.each`
          activeAlbum | nextAlbum
          ${null}     | ${'c1'}
          ${'c1'}     | ${'c2'}
        `('should switch to the next album ($nextAlbum)', ({ activeAlbum, nextAlbum }) => {
          expect(
            getNextActiveArtistAndAlbum(artists, artistAlbums, 'C', activeAlbum, ['C'], 1),
          ).toStrictEqual({
            artist: 'C',
            album: nextAlbum,
          });
        });

        describe('when the last album is active', () => {
          it('should keep the current selection', () => {
            expect.assertions(1);
            expect(
              getNextActiveArtistAndAlbum(artists, artistAlbums, 'C', 'c2', ['C'], 1),
            ).toStrictEqual({
              artist: 'C',
              album: 'c2',
            });
          });
        });
      });

      describe('when its albums are not expanded', () => {
        it('should keep the current selection', () => {
          expect.assertions(1);
          expect(
            getNextActiveArtistAndAlbum(artists, artistAlbums, 'C', null, ['A'], 1),
          ).toStrictEqual({
            artist: 'C',
            album: null,
          });
        });
      });
    });

    describe('when the second-to-last artist is active', () => {
      describe('when the last album is active', () => {
        it('should select the last artist', () => {
          expect.assertions(1);

          const artistAlbums2 = {
            B: ['b1', 'b2', 'b3'],
          };

          expect(
            getNextActiveArtistAndAlbum(artists, artistAlbums2, 'B', 'b3', ['B'], 1),
          ).toStrictEqual({
            artist: 'C',
            album: null,
          });
        });
      });
    });
  });

  describe('scrolling up', () => {
    describe('when nothing is active', () => {
      it('should switch to the last artist', () => {
        expect.assertions(1);
        expect(
          getNextActiveArtistAndAlbum(artists, artistAlbums, null, null, [], -1),
        ).toStrictEqual({
          artist: 'C',
          album: null,
        });
      });

      describe('when the last albums are expanded', () => {
        it('should switch to the last album', () => {
          expect.assertions(1);
          expect(
            getNextActiveArtistAndAlbum(artists, artistAlbums, null, null, ['C'], -1),
          ).toStrictEqual({
            artist: 'C',
            album: 'c2',
          });
        });
      });
    });

    describe('when the first artist is active', () => {
      describe('when its albums are not expanded', () => {
        it('should keep the current selection', () => {
          expect.assertions(1);
          expect(
            getNextActiveArtistAndAlbum(artists, artistAlbums, 'A', null, [], -1),
          ).toStrictEqual({
            artist: 'A',
            album: null,
          });
        });
      });

      describe('when its albums are expanded', () => {
        it('should switch to the previous album', () => {
          expect.assertions(1);
          expect(
            getNextActiveArtistAndAlbum(artists, artistAlbums, 'A', 'a3', ['A'], -1),
          ).toStrictEqual({
            artist: 'A',
            album: 'a2',
          });
        });

        describe('when the first album is active', () => {
          it('should switch to the artist', () => {
            expect.assertions(1);
            expect(
              getNextActiveArtistAndAlbum(artists, artistAlbums, 'A', 'a1', ['A'], -1),
            ).toStrictEqual({
              artist: 'A',
              album: null,
            });
          });
        });

        describe('when no album is active', () => {
          it('should keep the current selection', () => {
            expect.assertions(1);
            expect(
              getNextActiveArtistAndAlbum(artists, artistAlbums, 'A', null, ['A'], -1),
            ).toStrictEqual({
              artist: 'A',
              album: null,
            });
          });
        });
      });
    });

    describe('when a middle or last artist is active', () => {
      describe('when no album is active', () => {
        describe('when the previous albums are expanded', () => {
          it('should switch to the last album of the previous artist', () => {
            expect.assertions(1);
            expect(
              getNextActiveArtistAndAlbum(artists, artistAlbums, 'B', null, ['A'], -1),
            ).toStrictEqual({
              artist: 'A',
              album: 'a3',
            });
          });
        });

        describe('when the previous albums are not expanded', () => {
          it('should switch to the previous artist', () => {
            expect.assertions(1);
            expect(
              getNextActiveArtistAndAlbum(artists, artistAlbums, 'B', null, [], -1),
            ).toStrictEqual({
              artist: 'A',
              album: null,
            });
          });
        });
      });

      describe('when an album is active', () => {
        it('should switch to the previous album', () => {
          expect.assertions(1);
          expect(
            getNextActiveArtistAndAlbum(artists, artistAlbums, 'C', 'c2', ['C'], -1),
          ).toStrictEqual({
            artist: 'C',
            album: 'c1',
          });
        });
      });
    });
  });
});

describe(getScrollIndex.name, () => {
  describe('when on the Nth artist', () => {
    it('should return N', () => {
      expect.assertions(3);

      expect(getScrollIndex(['A', 'B', 'C'], {}, 'A', null, [])).toBe(0);
      expect(getScrollIndex(['A', 'B', 'C'], {}, 'B', null, [])).toBe(1);
      expect(getScrollIndex(['A', 'B', 'C'], {}, 'C', null, [])).toBe(2);
    });
  });

  describe('when an artist has its albums expanded', () => {
    it('should return the correct row number', () => {
      expect.assertions(5);

      const artistAlbums: Record<string, string[]> = {
        A: ['a1', 'a2'],
        B: ['b1'],
      };

      expect(getScrollIndex(['A', 'B'], artistAlbums, 'A', 'a1', ['A'])).toBe(1);
      expect(getScrollIndex(['A', 'B'], artistAlbums, 'A', 'a2', ['A'])).toBe(2);
      expect(getScrollIndex(['A', 'B'], artistAlbums, 'B', null, ['A'])).toBe(3);

      expect(getScrollIndex(['A', 'B'], artistAlbums, 'B', 'b1', ['B'])).toBe(2);

      expect(getScrollIndex(['A', 'B'], artistAlbums, 'B', 'b1', ['A', 'B'])).toBe(4);
    });
  });
});
