// Firebase Storage Rules:
//
// service firebase.storage {
//   match /b/angular-file-upload-ae72b.appspot.com/o {
//     match /{allPaths=**} {
//       allow read, write;
//     }
//   }
// }

angular.module('app', [])
  .config(() => (
    firebase.initializeApp({
      apiKey: 'AIzaSyBYlas88FDzvli5RrXQCzjM699NXQjBuNM',
      authDomain: 'angular-file-upload-ae72b.firebaseapp.com',
      databaseURL: 'https://angular-file-upload-ae72b.firebaseio.com',
      storageBucket: 'angular-file-upload-ae72b.appspot.com',
  })))
  .controller('UploadCtrl', function ($timeout, uploadFactory) {
    const up = this

    up.heading = 'Share your photos with the world!'

    $timeout()
      .then(() => firebase.database().ref('/images').once('value'))
      .then(snap => snap.val())
      .then(data => up.photos = data)

    up.submit = function () {
      const input = document.querySelector('[type="file"]')
      const file = input.files[0]

      const randomInteger = Math.random() * 1e17
      const getFileExtension = file.type.split('/').slice(-1)[0]
      const randomPath = `${randomInteger}.${getFileExtension}`

      uploadFactory.send(file, randomPath)
        .then(res => {
          up.photoURLs.push(res.downloadURL)
          return res.downloadURL
        })
        .then((url) => {
          firebase.database().ref('/images').push({url})
        })
    }
  })
  .factory('uploadFactory', ($timeout) => ({
    send (file, path = file.name) {
      return $timeout().then(() => (
        new Promise ((resolve, reject) => {
          const uploadTask = firebase.storage().ref()
            .child(path).put(file)

          uploadTask.on('state_changed',
            null,
            reject,
            () => resolve(uploadTask.snapshot)
          )
        })
      ))
    }
  }))
