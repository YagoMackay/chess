import { getXYPosition, isBlack } from './boardFunctions';

describe('boardFunctions', () => {
  describe('getXYPosition', () => {
    it('should return expected x,y position we we call it with', () => {
      // Arrange
      const i = 2;
      const turn = 'w';

      // Act
      const xy = getXYPosition({ i, turn });

      // Assert
      expect(xy).not.toBe(null);
      expect(xy).not.toEqual(0);
      expect(xy).toEqual({ x: 2, y: 7 });
      // TODO - Validate props and throw error if wrong turn is passed in. Create tests to check that error is thrown.
    });
  });
  describe('isBlack', () => {
    it('should return if player is black or white player', () => {
      //Arrange

      const i = 2;
      const turn = 'w';

      const { x, y } = getXYPosition({ i, turn });

      //Act

      const color = isBlack(i, turn);
      //Assert
      expect(color).not.toBe(null);
      expect(typeof color === 'boolean').toBeTruthy();
    });
  });
});
