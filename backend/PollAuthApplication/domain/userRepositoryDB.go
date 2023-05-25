package domain

import (
	"PollApp/src/PollAuthApplication/customError"
	"database/sql"
	"errors"
	"log"

	_ "github.com/lib/pq"
	"golang.org/x/crypto/bcrypt"
)

type UserRepositoryDB struct {
	client *sql.DB
}

func (urdb UserRepositoryDB) Register(user User) error {
	checkIfExistsSql := `select * from "User" where email = $1`
	rows, err := urdb.client.Query(checkIfExistsSql, user.Email)

	if err != nil {
		log.Println("Error while querying into users table", err.Error())
		return errors.New("unexpected database error")
	} else {
		if !rows.Next() {
			createSql := `insert into "User"(name, email, password) values($1, $2, $3)`

			pswd := []byte(user.Password)
			pswdHash, hashErr := bcrypt.GenerateFromPassword(pswd, bcrypt.DefaultCost)
			pswdHashInString := string(pswdHash)
			if hashErr != nil {
				log.Println("Error while hashing the user's password", hashErr.Error())
				return errors.New("unexpected database error")
			}

			_, err := urdb.client.Exec(createSql, user.Name, user.Email, pswdHashInString)

			if err != nil {
				log.Println("Error while inserting into users table", err.Error())
				return errors.New("unexpected database error")
			}
			return nil
		} else {
			return customError.ErrUserAlreadyExists
		}
	}
}

func (urdb UserRepositoryDB) Login(login Login) (*User, error) {
	checkIfExistsSql := `select * from "User" where email = $1`
	rows, err := urdb.client.Query(checkIfExistsSql, login.Email)

	if err != nil {
		log.Println("Error while querying into users table", err.Error())
		return nil, errors.New("unexpected database error")
	}

	users := make([]User, 0)
	for rows.Next() {
		var user User
		err := rows.Scan(&user.Id, &user.Name, &user.Email, &user.Password)
		if err != nil {
			log.Println("Error while scanning user", err.Error())
			return nil, errors.New("unexpected database error")
		}
		users = append(users, user)
	}

	if len(users) == 0 {
		return nil, customError.ErrInvalidCredentials
	}

	hashErr := bcrypt.CompareHashAndPassword([]byte(users[0].Password), []byte(login.Password))
	if hashErr != nil {
		return nil, customError.ErrInvalidCredentials
	}
	return &users[0], nil

}

func NewUserRepositoryDB(dbClient *sql.DB) UserRepositoryDB {
	return UserRepositoryDB{
		client: dbClient,
	}
}
