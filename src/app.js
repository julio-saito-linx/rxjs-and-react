import Rx from 'rx'
import superagent from 'superagent'

// https://egghead.io/lessons/rxjs-reactive-programming-using-cached-network-data-with-rxjs

export default function() {

  // html events: buttons
  // fromEvent: https://egghead.io/lessons/rxjs-event-delegation-with-rxjs
  let refreshButton = document.querySelector('.refresh')
  let refreshClickStream = Rx.Observable.fromEvent(refreshButton, 'click')

  let pictureButton1 = document.querySelector('.suggestion1 img')
  let picture1ClickStream = Rx.Observable.fromEvent(pictureButton1, 'click')

  let pictureButton2 = document.querySelector('.suggestion2 img')
  let picture2ClickStream = Rx.Observable.fromEvent(pictureButton2, 'click')

  let pictureButton3 = document.querySelector('.suggestion3 img')
  let picture3ClickStream = Rx.Observable.fromEvent(pictureButton3, 'click')

  // request and response
  let fetchGithubByOffsetStream = Rx.Observable.fromNodeCallback((query, cb) => {
    superagent
      .get('http://api.github.com/users')
      .accept('json')
      .query('since=' + query)
      .end((err, resp) => cb(err, resp && resp.body))
  })

  let randomNumber = () => Math.floor(Math.random() * 160000)

  // request1
  let startupRequestStream = Rx.Observable.just(randomNumber())

  // request2
  let requestOnRefreshStream = refreshClickStream
    .map(() => randomNumber())

  // merge requests
  let requestStream = startupRequestStream.merge(requestOnRefreshStream)
    .flatMap(offset => fetchGithubByOffsetStream(offset))

  // response
  let responseStream = requestStream
    .shareReplay(1) // save cache

  // startupRequestStream: r-------------------->
  // refreshClickStream:   -------r------------->
  // requestStream:        r------r------------->
  // responseStream:       ---R-------R--------->
  // pictureClickStream:   ---------------x--x-->
  // suggestion1Stream:    N--u---N---u---u--u-->

  let getRandomUser = (listUsers) => {
    return listUsers[Math.floor(Math.random() * listUsers.length)]
  }

  let createSuggestionStream = (responseStream, pictureClickStream) => {
    return responseStream.map(getRandomUser)
      .startWith(null)
      .merge(refreshClickStream.map(ev => null))
      .merge(
        pictureClickStream.withLatestFrom(responseStream,
          (x, R) => getRandomUser(R))
        )
  }

  let suggestion1Stream = createSuggestionStream(responseStream, picture1ClickStream)
  let suggestion2Stream = createSuggestionStream(responseStream, picture2ClickStream)
  let suggestion3Stream = createSuggestionStream(responseStream, picture3ClickStream)

  // Rendering ---------------------------------------------------
  let renderSuggestion = (suggestedUser, selector) => {
    let suggestionEl = document.querySelector(selector)
    if (suggestedUser === null) {
      suggestionEl.style.visibility = 'hidden'
    } else {
      suggestionEl.style.visibility = 'visible'

      let usernameEl = suggestionEl.querySelector('.username')
      usernameEl.href = suggestedUser.html_url
      usernameEl.textContent = suggestedUser.login

      let userIdEl = suggestionEl.querySelector('.user_id')
      userIdEl.textContent = suggestedUser.id

      let imgEl = suggestionEl.querySelector('img')
      imgEl.src = ""
      imgEl.src = suggestedUser.avatar_url
    }
  }

  suggestion1Stream.subscribe(user => {
    renderSuggestion(user, '.suggestion1')
  })

  suggestion2Stream.subscribe(user => {
    renderSuggestion(user, '.suggestion2')
  })

  suggestion3Stream.subscribe(user => {
    renderSuggestion(user, '.suggestion3')
  })




}

