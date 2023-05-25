package domain

import (
	"PollApp/src/PollAuthApplication/customError"
	"log"

	"github.com/golang-jwt/jwt"
)

type AuthToken struct {
	Token string `json:"token"`
}

func GenerateAuthToken(secretKey string, claims Claims) (*AuthToken, error) {
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	signingKey := []byte(secretKey)
	tokenString, err := token.SignedString(signingKey)
	if err != nil {
		log.Println("Error while generating JWT token string")
		return nil, err
	} else {
		return &AuthToken{
			Token: tokenString,
		}, nil
	}
}

func (at *AuthToken) VerifyToken(secretKey string) (bool, error) {
	tokenString := at.Token
	signingKey := []byte(secretKey)
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, customError.ErrInvalidCredentials
		}
		return signingKey, nil
	})

	if err != nil {
		log.Println("Error while parsing jwt token string", err.Error())
		return false, customError.ErrBadRequest
	}

	if _, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
		return true, nil
	} else {
		return false, customError.ErrInvalidCredentials
	}
}
