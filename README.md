# Impulsy

## Requirements

### Database

This project requires a running [MySQL](https://www.mysql.com/) server.

Settings related to the database access should be written in a **.env** file at the root of the project like so:

    DB_DATABASE_NAME=impulsy
    DB_USERNAME=root
    DB_PASSWORD=1234
    DB_HOST=localhost

Change the values to match your MySQL installation. The database should be created before starting the project using this command in the **mysql CLI**:

```sql
CREATE DATABASE impulsy;
```

## Getting started

Use these commands to clone the project and install the necessary node modules:

    git clone https://github.com/Logodenn/impulsy.git
    cd impulsy
    npm i

To start the project simply use:

    npm start