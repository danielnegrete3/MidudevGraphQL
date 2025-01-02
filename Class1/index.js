import { gql, ApolloServer, UserInputError } from "apollo-server";
import { v1 as uuid } from "uuid";


let persons = [
    {
        name: "Arto Hellas",
        phone: "040-123543",
        street: "Tapiolankatu 5 A",
        city: "Espoo",
        id: "3d594650-3436-11e9-bc57-8b80ba54c431"
    },
    {
        name: "Matti Luukkainen",
        phone: "040-432342",
        street: "Malminkaari 10 A",
        city: "Helsinki",
        id: "3d599470-3436-11e9-bc57-8b80ba54c431"
    },
    {
        name: "Venla Ruuska",
        street: "Nallemäentie 22 C",
        city: "Helsinki",
        id: "3d599471-3436-11e9-bc57-8b80ba54c431"
    },
    {
        name: "Daniel Negrete",
        street: "Calle 1",
        city: "Mexico",
        id: "3d599472-3436-11e9-bc57-8b80ba54c431"
    }
]

const typeDefs = gql`

    enum YesNo{
        YES
        NO
    }

    type Address{
        street: String!
        city: String!
    }

    type Person{
        name: String!
        phone: String
        address: Address!
        id: ID!
    }

    type Query{
        personCount: Int!
        allPeople(phone: YesNo): [Person]!
        findPerson(name: String!): Person
    }

    type Mutation{
        addPerson(
            name: String!
            phone: String
            street: String!
            city: String!
        ): Person

        modifyNumber(
            name: String!
            phone: String!
        ): Person
    }
`

const resolvers = {
    Query:{
        personCount: () => persons.length,
        allPeople: (root,args) => {
            if (!args.phone){
                return persons
            }

            const phone = args.phone === "YES"
            return persons.filter(p => phone ? p.phone : !p.phone)
        },
        findPerson: (root, args) => {
            const {name} = args
            return persons.find(p => p.name === name)
        }
    },
    Person:{
        address: (root) => {
            return {
                street: root.street,
                city: root.city
            }
        }
    },
    Mutation:{
        addPerson: (root, args) => {
            if (persons.find(p => p.name === args.name)){
                throw new UserInputError("Name must be unique",{invalidArgs: args.name})
            }

            const person = {...args, id: uuid()}
            persons = persons.concat(person)
            return person
        },
        modifyNumber: (root, args) => {
            const person = persons.findIndex(p => p.name === args.name)
            if (person === -1){
                return null
            }

            const updatedPerson = {...persons[person], phone: args.phone}
            console.log(updatedPerson, persons[person])
            persons[person] = updatedPerson
            return updatedPerson
        }
    }
}

const server = new ApolloServer({
    typeDefs,
    resolvers
})

server.listen().then(({ url }) => {
    console.log(`Server ready at ${url}`)
})