import {useStore} from 'effector-react'
import {useStoreMap} from 'effector-react'
import React from 'react'
import ReactDOM from 'react-dom'
import styled from 'styled-components'

import {makeSpaceMedia} from './media/api/makeSpaceMedia'

const Media = ({id, media, className}) => {
  const doc = useStoreMap({
    store: media.store.$data,
    keys: [id],
    fn: (data, [id]) => data[id],
  })

return <div className={className}>{doc.name}!</div>
}

const StyledMedia = styled(Media)`
  font-weight: bold;
`

const MediaList = ({media}) =>
  useStore(media.store.$order).map(id => (
    <StyledMedia id={id} key={id} media={media} />
  ))

function App() {
  const media = React.useMemo(() => makeSpaceMedia(), [])

  React.useEffect(() => {
    media.flow.query.query()
  }, [media])

  return (
    <div>
      <MediaList media={media} />
      <button onClick={() => media.event.doCreate({name: `foo`})}>
        CREATE
      </button>
    </div>
  )
}

const rootElement = document.getElementById('root')
ReactDOM.render(<App />, rootElement)
