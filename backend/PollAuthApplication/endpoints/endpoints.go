package endpoints

import (
	"PollApp/src/PollAuthApplication/domain"
	"PollApp/src/PollAuthApplication/service"
	"context"

	"github.com/go-kit/kit/endpoint"
)

type RegisterRequest struct {
	User domain.User `json:"user"`
}

type RegisterResponse struct {
	Err string `json:"err,omitempty"`
}

type LoginRequest struct {
	Login domain.Login `json:"login"`
}

type LoginResponse struct {
	Token string `json:"token"`
	Err   string `json:"err,omitempty"`
}

type VerifyRequest struct {
	Token string `json:"token"`
}

type VerifyReponse struct {
	IsAuthorized bool   `json:"isAuthorized"`
	Err          string `json:"msg,omitempty"`
}

func MakeRegisterEndpoint(svc service.Service) endpoint.Endpoint {
	return func(_ context.Context, request interface{}) (interface{}, error) {
		req := request.(RegisterRequest)
		err := svc.Register(req.User)
		if err != nil {
			return nil, err
		}
		return RegisterResponse{Err: ""}, nil
	}
}

func MakeLoginEndpoint(svc service.Service) endpoint.Endpoint {
	return func(_ context.Context, request interface{}) (interface{}, error) {
		req := request.(LoginRequest)
		token, err := svc.Login(req.Login)
		if err != nil {
			return nil, err
		}
		return LoginResponse{Token: *&token.Token, Err: ""}, nil
	}
}

func MakeVerifyEndpoint(svc service.Service) endpoint.Endpoint {
	return func(_ context.Context, request interface{}) (interface{}, error) {
		req := request.(VerifyRequest)
		authToken := domain.AuthToken{
			Token: req.Token,
		}
		isAuthorized, err := svc.Verify(authToken)
		if err != nil {
			return nil, err
		}
		return VerifyReponse{IsAuthorized: isAuthorized, Err: ""}, nil
	}
}
