package app

import (
	"PollApp/src/PollApplication/customError"
	"PollApp/src/PollApplication/domain"
	"PollApp/src/PollApplication/endpoints"
	"PollApp/src/PollApplication/service"
	"context"
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"net/http"
	"os"
	"strconv"

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
	svc := service.NewDefaultPollService(domain.NewPollRepositoryDB(dbClient))
	authServiceClient := NewDefaultAuthServiceClient()
	authMiddleware := AuthMiddleware(authServiceClient)

	router := mux.NewRouter()

	options := []httptransport.ServerOption{
		httptransport.ServerErrorEncoder(encodeError),
	}

	getAllPollsHandler := httptransport.NewServer(
		endpoints.MakeGetAllPollsEndpoint(svc),
		decodeGetAllPollsRequest,
		encodeResponse,
		options...,
	)

	createPollHandler := httptransport.NewServer(
		endpoints.MakeCreatePollEndpoint(svc),
		decodeCreatePollRequest,
		encodeResponse,
		options...,
	)

	getPollHandler := httptransport.NewServer(
		endpoints.MakeGetPollEndpoint(svc),
		decodeGetPollRequest,
		encodeResponse,
		options...,
	)

	getPollOptionsHandler := httptransport.NewServer(
		endpoints.MakeGetPollOptionsEndpoint(svc),
		decodeGetPollOptionsRequest,
		encodeResponse,
		options...,
	)

	getPollVotesHandler := httptransport.NewServer(
		endpoints.MakeGetPollVotesEndpoint(svc),
		decodeGetPollVotesRequest,
		encodeResponse,
		options...,
	)

	updatePollHandler := httptransport.NewServer(
		endpoints.MakeUpdatePollEndpoint(svc),
		decodeUpdatePollRequest,
		encodeResponse,
		options...,
	)

	createVoteHandler := httptransport.NewServer(
		endpoints.MakeCreateVoteEndpoint(svc),
		decodeCreateVoteRequest,
		encodeResponse,
		options...,
	)

	router.Use(CorsMiddleware)
	router.Use(authMiddleware)

	// Fetch the list of all the polls(active/inactive)
	router.Handle("/polls", getAllPollsHandler).Methods("GET", "OPTIONS")
	// Create a new pollpoll
	router.Handle("/polls", createPollHandler).Methods("POST", "OPTIONS")
	// Fetch the details of a given poll
	router.Handle("/polls/{id:[0-9]+}", getPollHandler).Methods("GET", "OPTIONS")
	// Fetch the options of a given poll
	router.Handle("/polls/{id:[0-9]+}/options", getPollOptionsHandler).Methods("GET", "OPTIONS")
	// Fetch the votes of a given poll
	router.Handle("/polls/{id:[0-9]+}/votes", getPollVotesHandler).Methods("GET", "OPTIONS")
	// Update the details of a given poll
	// Todo: Support partial updates of poll / poll options. Currently, only supports updating status of poll
	router.Handle("/polls/{id:[0-9]+}", updatePollHandler).Methods("PUT", "OPTIONS")
	// Vote for a given poll
	router.Handle("/users/{id:[0-9]+}/votes", createVoteHandler).Methods("POST", "OPTIONS")

	err := http.ListenAndServe(":8000", router)
	if err != nil {
		log.Fatalln(err)
	} else {
		fmt.Println("Server connected!")
	}
}

func decodeGetAllPollsRequest(_ context.Context, r *http.Request) (interface{}, error) {
	var request endpoints.GetAllPollsRequest
	queryParams := r.URL.Query()
	userId, err := strconv.Atoi(queryParams.Get("user_id"))
	if err != nil {
		request.UserId = 0
	} else {
		request.UserId = userId
	}
	return request, nil
}

func decodeCreatePollRequest(_ context.Context, r *http.Request) (interface{}, error) {
	var request endpoints.CreatePollRequest
	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		return nil, customError.ErrBadRequest
	}
	return request, nil
}

func decodeGetPollRequest(_ context.Context, r *http.Request) (interface{}, error) {
	var request endpoints.GetPollRequest
	vars := mux.Vars(r)
	id, err := strconv.Atoi(vars["id"])
	if err != nil {
		return nil, customError.ErrBadRequest
	}
	request.PollId = id
	return request, nil
}

func decodeGetPollOptionsRequest(_ context.Context, r *http.Request) (interface{}, error) {
	var request endpoints.GetPollOptionsRequest
	vars := mux.Vars(r)
	id, err := strconv.Atoi(vars["id"])
	if err != nil {
		return nil, customError.ErrBadRequest
	}
	request.PollId = id
	return request, nil
}

func decodeCreateVoteRequest(_ context.Context, r *http.Request) (interface{}, error) {
	var request endpoints.CreateVoteRequest
	vars := mux.Vars(r)
	id, err := strconv.Atoi(vars["id"])
	if err != nil {
		return nil, customError.ErrBadRequest
	}
	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		return nil, customError.ErrBadRequest
	}
	request.UserId = id
	return request, nil
}

func decodeGetPollVotesRequest(_ context.Context, r *http.Request) (interface{}, error) {
	var request endpoints.GetPollVotesRequest
	vars := mux.Vars(r)
	pollId, vErr := strconv.Atoi(vars["id"])
	if vErr != nil {
		return nil, customError.ErrBadRequest
	}
	request.PollId = pollId
	return request, nil
}

func decodeUpdatePollRequest(_ context.Context, r *http.Request) (interface{}, error) {
	var request endpoints.UpdatePollRequest
	vars := mux.Vars(r)
	pollId, err := strconv.Atoi(vars["id"])
	if err != nil {
		return nil, customError.ErrBadRequest
	}
	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		return nil, customError.ErrBadRequest
	}
	request.PollId = pollId
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
	case customError.ErrInvalidCredentials:
		httpStatusCode = http.StatusUnauthorized
		responseBody["isAuthorized"] = false
	default:
		httpStatusCode = http.StatusInternalServerError
	}
	responseBody["error"] = err.Error()
	w.WriteHeader(httpStatusCode)
	_ = json.NewEncoder(w).Encode(responseBody)
}

func encodeErrorFromStatusCode(statusCode int) error {
	var err error
	switch statusCode {
	case http.StatusBadRequest:
		err = customError.ErrBadRequest
	case http.StatusNotFound:
		err = customError.ErrNotFound
	case http.StatusUnauthorized:
		err = customError.ErrInvalidCredentials
	default:
		err = errors.New("Internal Server Error")
	}
	return err
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
