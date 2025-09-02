import { UpdateInfluencerUseCase } from './update-influencer.usecase';
import { IInfluencersRepo } from '../../../domain/repositories/influencers-repo';
import { Influencer } from '../../../domain/entities/influencer';
import { SocialPlatform } from '../../../domain/entities/social-platform';
import { isOk, isErr } from '../../common/result';
import { BaseSpecification } from '../../../domain/specifications/base-specification';
import { ISocialPlatformsRepo } from '../../../domain/repositories/social-platforms-repo';

describe('UpdateInfluencerUseCase', () => {
  let updateInfluencerUseCase: UpdateInfluencerUseCase;
  let mockInfluencersRepo: jest.Mocked<IInfluencersRepo>;
  let mockSocialPlatformsRepo: jest.Mocked<ISocialPlatformsRepo>;
  beforeEach(() => {
    mockInfluencersRepo = {
      findMany: jest.fn(),
      findOne: jest.fn(),
      count: jest.fn(),
      createMany: jest.fn(),
      updateMany: jest.fn(),
      deleteMany: jest.fn(),
      list: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      exists: jest.fn(),
    };

    mockSocialPlatformsRepo = {
      findMany: jest.fn(),
      findOne: jest.fn(),
      count: jest.fn(),
      createMany: jest.fn(),
      updateMany: jest.fn(),
      deleteMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      exists: jest.fn(),
      list: jest.fn(),
    };

    updateInfluencerUseCase = new UpdateInfluencerUseCase(mockInfluencersRepo, mockSocialPlatformsRepo);
  });

  describe('execute', () => {
    it('should update influencer successfully', async () => {
      // Arrange
      const influencerId = 1;
      const input = {
        id: influencerId,
        username: 'updateduser',
        email: 'updated@example.com',
        nameEn: 'Updated Name EN',
        nameAr: 'Updated Name AR',
        profilePictureUrl: 'https://updated-profile.jpg',
      };

      const socialPlatform = new SocialPlatform(1, 'instagram', 'https://instagram.com/olduser', 5000, influencerId, new Date(), new Date());

      const existingInfluencer = new Influencer(
        influencerId,
        'olduser',
        'old@example.com',
        'Old Name EN',
        'Old Name AR',
        'https://old-profile.jpg',
        [socialPlatform],
        new Date('2023-01-01'),
        new Date('2023-01-01'),
      );

      const updatedInfluencer = new Influencer(
        influencerId,
        'updateduser',
        'updated@example.com',
        'Updated Name EN',
        'Updated Name AR',
        'https://updated-profile.jpg',
        [socialPlatform], // Social platforms unchanged
        new Date('2023-01-01'),
        new Date('2023-06-01'),
      );

      mockInfluencersRepo.findOne.mockResolvedValue(existingInfluencer);
      mockInfluencersRepo.update.mockResolvedValue(updatedInfluencer);

      // Act
      const result = await updateInfluencerUseCase.execute(input);

      // Assert
      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.value.id).toBe(influencerId);
        expect(result.value.username).toBe('updateduser');
        expect(result.value.email).toBe('updated@example.com');
        expect(result.value.nameEn).toBe('Updated Name EN');
        expect(result.value.nameAr).toBe('Updated Name AR');
        expect(result.value.profilePictureUrl).toBe('https://updated-profile.jpg');
        expect(result.value.socialPlatforms).toHaveLength(1);
        expect(result.value.socialPlatforms[0].key).toBe('instagram');
        expect(result.value.createdAt).toBeInstanceOf(Date);
        expect(result.value.updatedAt).toBeInstanceOf(Date);
      }

      expect(mockInfluencersRepo.findOne).toHaveBeenCalledWith(new BaseSpecification<Influencer>().whereEqual('id', influencerId));
      expect(mockInfluencersRepo.findOne).toHaveBeenCalledWith(new BaseSpecification<Influencer>().whereEqual('email', 'updated@example.com'));
      expect(mockInfluencersRepo.update).toHaveBeenCalledWith(expect.objectContaining({
        id: influencerId,
        username: 'updateduser',
        email: 'updated@example.com',
      }));
    });

    it('should return error when influencer does not exist', async () => {
      // Arrange
      const input = {
        id: 999,
        username: 'nonexistent',
      };

      mockInfluencersRepo.findOne.mockResolvedValue(null);

      // Act
      const result = await updateInfluencerUseCase.execute(input);

      // Assert
      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error).toBeInstanceOf(Error);
        expect(result.error.message).toContain('999');
      }

      expect(mockInfluencersRepo.findOne).toHaveBeenCalledWith(new BaseSpecification<Influencer>().whereEqual('id', 999));
      expect(mockInfluencersRepo.update).not.toHaveBeenCalled();
    });

    it('should return error when username is already taken', async () => {
      // Arrange
      const influencerId = 1;
      const input = {
        id: influencerId,
        username: 'taken',
      };

      const existingInfluencer = new Influencer(
        influencerId,
        'current',
        'current@example.com',
        'Current User EN',
        'Current User AR',
        '',
        [],
        new Date(),
        new Date(),
      );

      const influencerWithTakenUsername = new Influencer(
        2,
        'taken',
        'other@example.com',
        'Other User EN',
        'Other User AR',
        '',
        [],
        new Date(),
        new Date(),
      );

      mockInfluencersRepo.findOne
        .mockResolvedValueOnce(existingInfluencer)
        .mockResolvedValueOnce(influencerWithTakenUsername);

      // Act
      const result = await updateInfluencerUseCase.execute(input);

      // Assert
      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error).toBeInstanceOf(Error);
        expect(result.error.message).toContain('taken');
      }

      expect(mockInfluencersRepo.findOne).toHaveBeenCalledWith(new BaseSpecification<Influencer>().whereEqual('id', influencerId));
      expect(mockInfluencersRepo.findOne).toHaveBeenCalledWith(new BaseSpecification<Influencer>().whereEqual('username', 'taken'));
      expect(mockInfluencersRepo.update).not.toHaveBeenCalled();
    });

    it('should return error when email is already taken', async () => {
      // Arrange
      const influencerId = 1;
      const input = {
        id: influencerId,
        email: 'taken@example.com',
      };

      const existingInfluencer = new Influencer(
        influencerId,
        'current',
        'current@example.com',
        'Current User EN',
        'Current User AR',
        '',
        [],
        new Date(),
        new Date(),
      );

      const influencerWithTakenEmail = new Influencer(
        2,
        'other',
        'taken@example.com',
        'Other User EN',
        'Other User AR',
        '',
        [],
        new Date(),
        new Date(),
      );

      mockInfluencersRepo.findOne
        .mockResolvedValueOnce(existingInfluencer)
        .mockResolvedValueOnce(influencerWithTakenEmail);

      // Act
      const result = await updateInfluencerUseCase.execute(input);

      // Assert
      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error).toBeInstanceOf(Error);
        expect(result.error.message).toContain('taken@example.com');
      }

      expect(mockInfluencersRepo.findOne).toHaveBeenCalledWith(new BaseSpecification<Influencer>().whereEqual('id', influencerId));
      expect(mockInfluencersRepo.findOne).toHaveBeenCalledWith(new BaseSpecification<Influencer>().whereEqual('email', 'taken@example.com'));
      expect(mockInfluencersRepo.update).not.toHaveBeenCalled();
    });

    it('should allow influencer to keep same username and email', async () => {
      // Arrange
      const influencerId = 1;
      const input = {
        id: influencerId,
        nameEn: 'Updated Name',
        username: 'sameuser', // Same username as current
        email: 'same@example.com', // Same email as current
      };

      const socialPlatform = new SocialPlatform(1, 'instagram', 'https://instagram.com/user', 5000, influencerId, new Date(), new Date());

      const existingInfluencer = new Influencer(
        influencerId,
        'sameuser',
        'same@example.com',
        'Old Name EN',
        'Old Name AR',
        '',
        [socialPlatform],
        new Date(),
        new Date(),
      );

      const updatedInfluencer = new Influencer(
        influencerId,
        'sameuser',
        'same@example.com',
        'Updated Name',
        'Old Name AR',
        '',
        [socialPlatform],
        new Date(),
        new Date(),
      );

      mockInfluencersRepo.findOne.mockResolvedValue(existingInfluencer);
      // Don't mock findByUsername/findByEmail since username and email haven't changed
      mockInfluencersRepo.update.mockResolvedValue(updatedInfluencer);

      // Act
      const result = await updateInfluencerUseCase.execute(input);

      // Assert
      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.value.nameEn).toBe('Updated Name');
        expect(result.value.username).toBe('sameuser');
        expect(result.value.email).toBe('same@example.com');
      }

      expect(mockInfluencersRepo.findOne).toHaveBeenCalledWith(
        expect.objectContaining({
          criteria: expect.arrayContaining([
            expect.objectContaining({ id: influencerId })
          ])
        })
      );
      // expect(mockInfluencersRepo.findOne).toHaveBeenCalledWith(new BaseSpecification<Influencer>().whereEqual('username', 'sameuser')); // Should not check since it's the same
      // expect(mockInfluencersRepo.findOne).toHaveBeenCalledWith(new BaseSpecification<Influencer>().whereEqual('email', 'same@example.com')); // Should not check since it's the same
      expect(mockInfluencersRepo.update).toHaveBeenCalled();
    });

    it('should update only provided fields', async () => {
      // Arrange
      const influencerId = 1;
      const input = {
        id: influencerId,
        nameEn: 'Only Name Updated', // Only updating nameEn
      };

      const socialPlatform = new SocialPlatform(1, 'youtube', 'https://youtube.com/user', 10000, influencerId, new Date(), new Date());

      const existingInfluencer = new Influencer(
        influencerId,
        'keepuser',
        'keep@example.com',
        'Old Name EN',
        'Keep nameAr',
        'https://keep-profile.jpg',
        [socialPlatform],
        new Date('2023-01-01'),
        new Date('2023-01-01'),
      );

      const updatedInfluencer = new Influencer(
        influencerId,
        'keepuser', // Unchanged
        'keep@example.com', // Unchanged
        'Only Name Updated',
        'Keep nameAr', // Unchanged
        'https://keep-profile.jpg', // Unchanged
        [socialPlatform], // Unchanged
        new Date('2023-01-01'),
        new Date('2023-06-01'),
      );

      mockInfluencersRepo.findOne.mockResolvedValue(existingInfluencer);
      mockInfluencersRepo.update.mockResolvedValue(updatedInfluencer);

      // Act
      const result = await updateInfluencerUseCase.execute(input);

      // Assert
      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.value.nameEn).toBe('Only Name Updated');
        expect(result.value.username).toBe('keepuser'); // Unchanged
        expect(result.value.email).toBe('keep@example.com'); // Unchanged
        expect(result.value.nameAr).toBe('Keep nameAr'); // Unchanged
      }

      expect(mockInfluencersRepo.update).toHaveBeenCalledWith(expect.objectContaining({
        nameEn: 'Only Name Updated',
        username: 'keepuser',
        email: 'keep@example.com',
        nameAr: 'Keep nameAr',
      }));
    });
  });
});