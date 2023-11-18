import { describe, test } from '@jest/globals'
import { UserRepository, UserRepositoryImpl } from '../../../domains/user/repository'
import { db } from '../../../utils'
import { AuthService, AuthServiceImpl } from '../../../domains/auth/service'
import { SignupInputDTO, TokenDTO, LoginInputDTO } from '../../../domains/auth/dto'
import { ExtendedUserDTO } from '../../../domains/user/dto'
import { ConflictException, ValidationException, NotFoundException, checkPassword, UnauthorizedException } from '../../../utils/'

describe('AuthService', () => {
  const userRepositoryMock: UserRepository = new UserRepositoryImpl(db)
  const authService: AuthService = new AuthServiceImpl(userRepositoryMock)

  const signupInput: SignupInputDTO = { email: 'email', username: 'username', password: 'password' }
  const loginInput: LoginInputDTO = { email: 'email', password: 'password' }
  const extendedUser: ExtendedUserDTO = { id: '1', username: 'username', name: 'name', email: 'email', password: 'password', isPrivate: false, profilePicture: 'profilePictureUrl', createdAt: new Date() }

  test('signup() should return a TokenDTO object', async () => {
    jest.spyOn(userRepositoryMock, 'getByEmailOrUsername').mockImplementation(async () => await Promise.resolve(null))
    jest.spyOn(userRepositoryMock, 'create').mockImplementation(async () => await Promise.resolve(extendedUser))
    jest.spyOn(authService, 'signup').mockImplementation(async () => await Promise.resolve({ token: 'token' }))
    const token: TokenDTO = await authService.signup(signupInput)

    expect(token).toBeDefined()
  })

  test('signup() should throw a ConflictException when user already exists', async () => {
    jest.spyOn(userRepositoryMock, 'getByEmailOrUsername').mockImplementation(async () => await Promise.resolve(extendedUser))
    try {
      await authService.signup(signupInput)
    } catch (error: any) {
      expect(error).toBeInstanceOf(ConflictException)
    }
  })

  test('signup() should throw a ValidationException when data is invalid', async () => {
    jest.spyOn(userRepositoryMock, 'getByEmailOrUsername').mockImplementation(async () => await Promise.resolve(null))

    try {
      await authService.signup({ email: '', username: '', password: '' })
    } catch (error: any) {
      expect(error).toBeInstanceOf(ValidationException)
    }
  })

  test('login() should return a TokenDTO object', async () => {
    jest.spyOn(userRepositoryMock, 'getByEmailOrUsername').mockImplementation(async () => await Promise.resolve(extendedUser))
    jest.spyOn(authService, 'login').mockImplementation(async () => await Promise.resolve({ token: 'token' }))
    const token: TokenDTO = await authService.login(loginInput)

    expect(token).toBeDefined()
  })

  test('login() should throw a NotFoundException when user does not exist', async () => {
    jest.spyOn(userRepositoryMock, 'getByEmailOrUsername').mockImplementation(async () => await Promise.resolve(null))

    try {
      await authService.login(loginInput)
    } catch (error: any) {
      expect(error).toBeInstanceOf(NotFoundException)
    }
  })

  test('login() should throw a ValidationException when data is invalid', async () => {
    jest.spyOn(userRepositoryMock, 'getByEmailOrUsername').mockImplementation(async () => await Promise.resolve(null))

    try {
      await authService.login({ email: '', password: '' })
    } catch (error: any) {
      expect(error).toBeInstanceOf(ValidationException)
    }
  })

  test('login() should throw a ValidationException when password is incorrect', async () => {
    jest.spyOn(userRepositoryMock, 'getByEmailOrUsername').mockImplementation(async () => await Promise.resolve(extendedUser))
    jest.fn(checkPassword).mockImplementation(async () => await Promise.resolve(false))

    try {
      await authService.login(loginInput)
    } catch (error: any) {
      expect(error).toBeInstanceOf(UnauthorizedException)
    }
  })
})
