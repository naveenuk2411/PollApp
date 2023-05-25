package domain

import "github.com/golang-jwt/jwt"

type Claims struct {
	Id    int    `json:"id"`
	Email string `json:"email"`
	Name  string `json:"name"`
	jwt.StandardClaims
}

func GetTokenClaims(id int, email string, name string) Claims {
	return Claims{
		Id:    id,
		Email: email,
		Name:  name,
	}
}
