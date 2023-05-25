package app

import (
	"PollApp/src/PollAuthApplication/customError"
	"PollApp/src/PollAuthApplication/domain"
	"PollApp/src/PollAuthApplication/endpoints"
	"PollApp/src/PollAuthApplication/service"
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"

	httptransport "github.com/go-kit/kit/transport/http"
	"github.com/gorilla/mux"
	"github.com/joho/godotenv"
)

func getEnvVariable(key string) string {
	err := godotenv.Load(".env")

	if err != nil {
		log.Fatalln("Error loading .env file")
	}
	return os.Getenv(key)
}

func Start() {

	dbClient := getDBClient()
	svc := service.NewDefaultAuthService(domain.NewUserRepositoryDB(dbClient))
	router := mux.NewRouter()

	options := []httptransport.ServerOption{
		httptransport.ServerErrorEncoder(encodeError),
	}

	registerHandler := httptransport.NewServer(
		endpoints.MakeRegisterEndpoint(svc),
		decodeRegisterRequest,
		encodeResponse,
		options...,
	)

	loginHandler := httptransport.NewServer(
		endpoints.MakeLoginEndpoint(svc),
		decodeLoginRequest,
		encodeResponse,
		options...,
	)

	verifyHandler := httptransport.NewServer(
		endpoints.MakeVerifyEndpoint(svc),
		decodeVerifyRequest,
		encodeResponse,
		options...,
	)

	router.Use(CorsMiddleware)

	router.Handle("/register", registerHandler).Methods("POST", "OPTIONS")
	router.Handle("/login", loginHandler).Methods("POST", "OPTIONS")
	router.Handle("/verify", verifyHandler).Methods("POST", "OPTIONS")

	err := http.ListenAndServe(":9000", router)
	if err != nil {
		log.Fatalln(err)
	} else {
		fmt.Println("Auth server started!")
	}
}

func decodeRegisterRequest(_ context.Context, r *http.Request) (interface{}, error) {
	var request endpoints.RegisterRequest
	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		return nil, customError.ErrBadRequest
	}
	return request, nil
}

func decodeLoginRequest(_ context.Context, r *http.Request) (interface{}, error) {
	var request endpoints.LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		return nil, customError.ErrBadRequest
	}
	return request, nil
}

func decodeVerifyRequest(_ context.Context, r *http.Request) (interface{}, error) {
	var request endpoints.VerifyRequest
	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		return nil, customError.ErrBadRequest
	}
	return request, nil
}

func encodeResponse(_ context.Context, w http.ResponseWriter, response interface{}) error {
	w.Header().Set("Content-Type", "application/json")
	return json.NewEncoder(w).Encode(response)
}

func encodeError(_ context.Context, err error, w http.ResponseWriter) {
	w.Header().Set("Content-Type", "application/json")
	responseBody := make(map[string]interface{})
	var httpStatusCode int
	switch err {
	case customError.ErrBadRequest:
		httpStatusCode = http.StatusBadRequest
	case customError.ErrNotFound:
		httpStatusCode = http.StatusNotFound
	case customError.ErrUserAlreadyExists:
		httpStatusCode = http.StatusConflict
	case customError.ErrInvalidCredentials:
		httpStatusCode = http.StatusUnauthorized
		responseBody["isAuthorized"] = false
	default:
		httpStatusCode = http.StatusInternalServerError
	}
	http.Error(w, err.Error(), httpStatusCode)
}

func getDBClient() *sql.DB {
	psqlInfo := fmt.Sprintf("host=%s port=%s user=%s "+
		"password=%s dbname=%s sslmode=disable",
		getEnvVariable("DB_HOST"), getEnvVariable("DB_PORT"), getEnvVariable("DB_USER"), getEnvVariable("DB_PASSWORD"), getEnvVariable("DB_NAME"))

	db, err := sql.Open("postgres", psqlInfo)
	if err != nil {
		panic(err)
	}

	err = db.Ping()
	if err != nil {
		panic(err)
	}

	fmt.Println("Database connected!")
	return db
}
