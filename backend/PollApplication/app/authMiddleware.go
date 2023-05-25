package app

import (
	"PollApp/src/PollApplication/customError"
	"bytes"
	"encoding/json"
	"log"
	"net/http"
	"strings"

	"github.com/gorilla/mux"
)

type VerifyRequest struct {
	Token string `json:"token"`
}

type VerifyResponse struct {
	IsAuthorized bool `json:"isAuthorized"`
}

type AuthServiceClient interface {
	Verify(VerifyRequest) (*VerifyResponse, error)
}

type DefaultAuthServiceClient struct{}

func (dasc DefaultAuthServiceClient) Verify(verfiyRequest VerifyRequest) (*VerifyResponse, error) {
	const authServiceUri = "http://localhost:9000/verify"
	verifyRequestJSON, jsonMarshallErr := json.Marshal(verfiyRequest)

	if jsonMarshallErr != nil {
		log.Println("Error while encoding verify request to auth service")
		return nil, jsonMarshallErr
	}

	res, authServiceErr := http.Post(authServiceUri, "application/json", bytes.NewBuffer(verifyRequestJSON))

	if res.StatusCode != http.StatusOK {
		return nil, encodeErrorFromStatusCode(res.StatusCode)
	}

	if authServiceErr != nil {
		log.Println("Error while calling auth service")
		return nil, authServiceErr
	}

	var verifyResponse VerifyResponse
	jsonUnmarshalErr := json.NewDecoder(res.Body).Decode(&verifyResponse)

	if jsonUnmarshalErr != nil {
		log.Println("Error while decoding verify response from auth service")
		return nil, jsonUnmarshalErr
	}
	return &verifyResponse, nil
}

func NewDefaultAuthServiceClient() DefaultAuthServiceClient {
	return DefaultAuthServiceClient{}
}

func AuthMiddleware(authServiceClient AuthServiceClient) mux.MiddlewareFunc {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			authHeader := r.Header.Get("Authorization")

			if authHeader == "" {
				encodeError(r.Context(), customError.ErrBadRequest, w)
			} else {
				authToken := getTokenFromHeader(authHeader)

				if authToken == "" {
					encodeError(r.Context(), customError.ErrBadRequest, w)
					return
				}
				var verifyRequest VerifyRequest
				verifyRequest.Token = authToken
				verifyResponse, err := authServiceClient.Verify(verifyRequest)

				if err != nil {
					encodeError(r.Context(), err, w)
				} else if verifyResponse.IsAuthorized {
					next.ServeHTTP(w, r)
				} else {
					encodeError(r.Context(), customError.ErrInvalidCredentials, w)
				}
			}
		})
	}
}

func getTokenFromHeader(header string) string {
	token := strings.Split(header, "Bearer")
	if len(token) == 2 {
		return strings.TrimSpace(token[1])
	}
	return ""
}
