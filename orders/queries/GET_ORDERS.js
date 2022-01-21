import { gql } from "@apollo/client"

export const GET_ORDERS = gql`
  query getOrders($first: Int, $after: String, $last: Int, $before: String) {
    orders(
      first: $first
      after: $after
      last: $last
      before: $before
      reverse: true
    ) {
      edges {
        cursor
        node {
          id
          billingAddress {
            address1
            address2
            city
            latitude
            longitude
            name
          }
        }
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
      }
    }
  }
`
