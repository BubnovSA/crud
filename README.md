# CRUD API application

### 1. Init node modules:
```
yarn
```
###  2. Start application:
```
docker-compose up
```
### 3. Init database:
```
docker exec -it crud-database-1 psql -U postgres -d testdb
```
### 4. Run SQL for init:
```
docker exec -it crud-database-1 psql -U postgres -d testdb
```

### After preparation, you can start working with application.

### 1. Use for get all items:
```
curl -X GET http://localhost:3000/items
```
### 2. Use for get item by id:
```
curl -X GET http://localhost:3000/items/1
```
### 3. Use curl for add new item:
```
curl -X POST http://localhost:3000/items \
-H "Content-Type: application/json" \
-d '{"name": "Pizza", "description": "Delicious cheese pizza"}'
