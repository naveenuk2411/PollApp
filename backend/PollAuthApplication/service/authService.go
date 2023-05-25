package service

import (
	"PollApp/src/PollAuthApplication/domain"
)

const secretKey string = "CbSvJp1U2ciO6DUPsNLiq5FMKWew2Vd5"

type Service interface {
	Register(domain.User) error
	Login(domain.Login) (*domain.AuthToken, error)
	Verify(domain.AuthToken) (bool, error)
}

type DefaultAuthService struct {
	repo domain.UserRepo
}

func (as DefaultAuthService) Register(user domain.User) error {
	return as.repo.Register(user)
}

func (as DefaultAuthService) Login(login domain.Login) (*domain.AuthToken, error) {
	var user *domain.User
	user, err := as.repo.Login(login)
	if err != nil {
		return nil, err
	} else {
		claims := domain.GetTokenClaims(user.Id, user.Email, user.Name)
		return domain.GenerateAuthToken(secretKey, claims)
	}
}

func (as DefaultAuthService) Verify(authToken domain.AuthToken) (bool, error) {
	return authToken.VerifyToken(secretKey)
}

func NewDefaultAuthService(repo domain.UserRepo) DefaultAuthService {
	return DefaultAuthService{repo: repo}
}
