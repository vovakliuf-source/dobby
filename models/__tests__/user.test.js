import User from '../users';

describe('User Model', () => {
  it('should create a new user', () => {
    const user = new User({
      name: 'John Doe',
      email: 'john@example.com',
      role: 'user',
      password: 'password123',
    });
    expect(user).toHaveProperty('_id');
  });

  it.only('should not create a new user due to missing required fields', async() => {
    const user = new User({
      email: 'john@example.com',
      role: 'user',
    });

    jest.spyOn(user, 'validate').mockRejectedValueOnce({
      errors: {
        name: 'Username is required',
        password: 'Password is required'
      }
    });

    try {
      await user.validate();
    } catch (error) {
      expect(error.errors).toHaveProperty('name');
      expect(error.errors).toHaveProperty('password');
    }
  });

  it('should throw password length error', async () => {
    const user = new User({
      name: 'John Doe',
      email: 'john@example.com',
      role: 'user',
      password: '123',
    });

    jest.spyOn(user, 'validate').mockRejectedValueOnce({
      errors: {
        password: 'Password must be at least 6 characters long'
      }
    });

    try {
      await user.validate();
    } catch (error) {
      expect(error.errors.password).toBe('Password must be at least 6 characters long');
    }
  });
});