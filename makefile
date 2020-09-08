home:
	curl -H "Authorization: Bearer $(t)" localhost:8080

register:
	curl -v -H "Content-Type: application/json" -d \
	'{ "email": "$(e)" ,"password": "$(p)" }' localhost:8080/auth/register
login:
	curl -v -H "Content-Type: application/json" -d\
	'{ "email": "$(e)" ,"password": "$(p)" }' -XPOST localhost:8080/auth/login
refresh:
	curl -H "Content-Type: application/json" -d\
	'{ "refreshToken": "$(r)"}' localhost:8080/auth/refresh-token
logout:
	curl -v -H "Content-Type: application/json" -d \
	'{ "refreshToken": "$(r)"}' -XDELETE localhost:8080/auth/logout

