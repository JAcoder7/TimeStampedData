# TimeStampedData
A JSON-like data structure for storing and synchronizing data across multiple clients

Work in progress

```
root: {
    todoLists: {
        ds998146: {
            todos: {
                0: {
                    description: "Task 1" | 1704130792494
                } | 1704130749583,
                1: {
                    description: "Task 2"
                } | 1704130750483
            },
            linkedUsers: {  
                af998171: /users/1
            }
        }
    }
    
    users: {
        1: {
            name: "FirstName" | 1704130853795,
            lastName: "LastName" | 1704130938594
        } ,
        2[rem]: {
            name: "Firstname2",
            lastName: "LastName" | 1704195674893
        } 
    } 
} 
```

## Query
Example:
```
    todoLists.query("./ds998146")
    todoLists.query("../users")
    todoLists.query("/users")
```