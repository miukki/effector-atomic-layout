import {createDomain} from 'effector'
import uuid from 'uuid/v4'

function makeEvents(domain) {
  const doCreate = domain.event(`doCreate`)
  const doCreateUUID = doCreate.filterMap(doc =>
    doc.id
      ? doc
      : {
          id: uuid(),
          ...doc,
        },
  )

  return {
    doCreate,
    doCreateUUID,
  }
}

function makeStorages(domain, event) {
  const $data = domain.store({}, {name: `$data`})
  const $order = domain.store([], {name: `$order`})

  return {
    $data,
    $order,
  }
}

function flowCreate(domain, event, store) {
  store.$data.on(event.doCreateUUID, (_, doc) => ({..._, [doc.id]: doc}))
  store.$order.on(event.doCreateUUID, (_, doc) => [doc.id, ..._])
}

function flowQuery(domain, event, store) {
  const onQuery = async () => {}

  const onQueryFake = async () => {
    return [{id: uuid(), name: `name1`}, {id: uuid(), name: `name2`}]
  }

  const query = domain.effect(`query`, {
    handler: onQueryFake,
  })

  store.$data.on(query.done, (state, {result, params}) => {
    return result.reduce((acc, doc) => {
      acc[doc.id] = doc
      return acc
    }, {})
  })

  store.$order.on(query.done, (state, {result, params}) => {
    return result.map(doc => doc.id)
  })

  return {
    onQuery,
    onQueryFake,
    query,
  }
}

function flowWatch(domain, event, store) {
  store.$data.watch(state => console.log(`$data`, state))
  store.$order.watch(state => console.log(`$order`, state))

  return {}
}

export const makeSpaceMedia = () => {
  const domain = createDomain(`media`)

  const event = makeEvents(domain)
  const store = makeStorages(domain, event)
  const flow = {
    create: flowCreate(domain, event, store),
    query: flowQuery(domain, event, store),
    watch: flowWatch(domain, event, store),
  }

  return {
    domain,
    event,
    flow,
    store,
  }
}
