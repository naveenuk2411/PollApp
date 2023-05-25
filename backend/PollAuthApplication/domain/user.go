package domain

type User struct {
	Id       int    `json:"id,omitempty"`
	Name     string `json:"name"`
	Password string `json:"password"`
	Email    string `json:"email"`
}

type UserRepo interface {
	Register(User) error
	Login(Login) (*User, error)
}
