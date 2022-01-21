import {
  Card,
  IndexTable,
  Layout,
  Page,
  Pagination,
  Stack,
  TextContainer,
  TextStyle,
  Thumbnail,
} from "@shopify/polaris"
import React, { useEffect, useState } from "react"

import { GET_ORDERS } from "../orders/queries/GET_ORDERS"
import { useQuery } from "@apollo/client"

export default function OrdersExample() {
  // * Set results per page
  const resultsPerPage = 5

  // * Store query variables in state, so they can be changed
  const [queryVariables, setQueryVariables] = useState({
    first: resultsPerPage,
    after: null,
    last: null,
    before: null,
  })

  // * Start initial query
  const { data, loading, fetchMore } = useQuery(GET_ORDERS, {
    variables: queryVariables,
    notifyOnNetworkStatusChange: true,
  })

  // *  Prefetch next page for a better user experience
  // ! Quick page navigation can lead to API throttling
  useEffect(() => {
    if (data?.productVariants?.edges) {
      fetchMore({
        variables: {
          first: resultsPerPage,
          after: data.productVariants.edges.at(-1)?.cursor,
          last: null,
          before: null,
        },
      })
    }
  }, [data])

  return (
    <Page title="Pagination Demo" breadcrumbs={[{ content: "Back", url: "/" }]}>
      <Layout>
        <Layout.Section>
          <TextContainer>
            <p>
              This is a demo of a relay pagination with apollo client. To use
              this with other resources add a{" "}
              <TextStyle variation="code">typePolicy</TextStyle> to the Apollo
              cache in <TextStyle variation="code">_app.js</TextStyle>
            </p>
          </TextContainer>
        </Layout.Section>
        <Layout.Section>
          <Card>
            <IndexTable
              resourceName={{ singular: "variant", plural: "variants" }}
              itemCount={data ? data.orders.edges.length : 0}
              headings={[
                { title: "Name" },
                { title: "City" },
                { title: "Koordinaten" },
              ]}
              selectable={false}
              loading={loading}
            >
              {data?.orders &&
                data.orders.edges.map((order) => {
                  const { id, billingAddress } = order.node
                  if (billingAddress)
                    return (
                      <IndexTable.Row key={id}>
                        <IndexTable.Cell>
                          <Stack vertical spacing="extraTight">
                            <TextStyle variation="strong">
                              {billingAddress.name}
                            </TextStyle>
                          </Stack>
                        </IndexTable.Cell>
                        <IndexTable.Cell>{billingAddress.city}</IndexTable.Cell>
                        <IndexTable.Cell>
                          {billingAddress.longitude}, {billingAddress.latitude}
                        </IndexTable.Cell>
                      </IndexTable.Row>
                    )
                })}
            </IndexTable>
            <Card.Section>
              <Stack distribution="center">
                <Pagination
                  hasPrevious={
                    data?.orders && data.orders.pageInfo.hasPreviousPage
                  }
                  hasNext={data?.orders && data.orders.pageInfo.hasNextPage}
                  onPrevious={() => {
                    // * Use fetchMore to utilize cache
                    fetchMore({
                      variables: {
                        first: null,
                        after: null,
                        last: 5,
                        before: data.orders.edges[0].cursor,
                      },
                    })

                    // * Add the new query variables to the original query
                    // ! If the variables are not changed, data will not change
                    setQueryVariables((prev) => {
                      let obj = { ...prev }
                      obj.first = null
                      obj.after = null
                      obj.last = 5
                      obj.before = data.orders.edges[0].cursor
                      return obj
                    })
                  }}
                  onNext={() => {
                    // * Use fetchMore to utilize cache
                    // * The next page is already prefetched. Navigation should be quick and responsive
                    fetchMore({
                      variables: {
                        first: 5,
                        after: data.orders.edges.at(-1).cursor,
                        last: null,
                        before: null,
                      },
                    })

                    // * Add the new query variables to the original query
                    // ! If the variables are not changed, data will not change
                    setQueryVariables((prev) => {
                      let obj = { ...prev }
                      obj.first = 5
                      obj.after = data.orders.edges.at(-1).cursor
                      obj.last = null
                      obj.before = null
                      return obj
                    })
                  }}
                ></Pagination>
              </Stack>
            </Card.Section>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  )
}
