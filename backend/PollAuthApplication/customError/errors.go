package customError

import "errors"

var ErrBadRequest = errors.New("bad request")
var ErrNotFound = errors.New("invalid id")
var ErrInvalidCredentials = errors.New("invalid email or password")
var ErrUserAlreadyExists = errors.New("user already exists with the provided email")
