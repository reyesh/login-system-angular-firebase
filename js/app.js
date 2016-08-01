var app = angular.module('GalleryApp', ['ngRoute', 'firebase']);

// for ngRoute
app.run(["$rootScope", "$location", function($rootScope, $location) {
  $rootScope.$on("$routeChangeError", function(event, next, previous, error) {
    // We can catch the error thrown when the $requireSignIn promise is rejected
    // and redirect the user back to the home page
    console.log(error);
    if (error === "AUTH_REQUIRED") {
      $location.path("/login");
    }
  });
}]);

app.config(["$routeProvider", function($routeProvider) {
  $routeProvider.when("/login", {
    // the rest is the same for ui-router and ngRoute...
    controller: "LoginCtrl",
    templateUrl: "views/login.html",
    resolve: {
      // controller will not be loaded until $waitForSignIn resolves
      // Auth refers to our $firebaseAuth wrapper in the example above
      "currentAuth": ["Auth", function(Auth) {
        // $waitForSignIn returns a promise so the resolve waits for it to complete
        return Auth.$waitForSignIn();
      }]
    }
  }).when("/home", {
    // the rest is the same for ui-router and ngRoute...
    controller: "HomeCtrl",
    templateUrl: "views/home.html",
    resolve: {
      // controller will not be loaded until $waitForSignIn resolves
      // Auth refers to our $firebaseAuth wrapper in the example above
      "currentAuth": ["Auth", function(Auth) {
        // $waitForSignIn returns a promise so the resolve waits for it to complete
        return Auth.$requireSignIn();
      }]
    }
  }).when("/account", {
    // the rest is the same for ui-router and ngRoute...
    controller: "AccountCtrl",
    templateUrl: "views/account.html",
    resolve: {
      // controller will not be loaded until $requireSignIn resolves
      // Auth refers to our $firebaseAuth wrapper in the example above
      "currentAuth": ["Auth", function(Auth) {
        // $requireSignIn returns a promise so the resolve waits for it to complete
        // If the promise is rejected, it will throw a $stateChangeError (see above)
        return Auth.$requireSignIn();
      }]
    }
  }).otherwise({ 
        redirectTo: '/home' 
      }); ;
}]);

app.controller("LoginCtrl", ["currentAuth", "$scope", "Auth", "$route", function(currentAuth, $scope, Auth, $route) {
  // currentAuth (provided by resolve) will contain the
  // authenticated user or null if not signed in
  $scope.auth = Auth;

  $scope.signUp = function(){

    firebase.auth().createUserWithEmailAndPassword($scope.email, $scope.password).then(function(){

      console.log("New Account created");

    }).catch(function(error) {
      // Handle Errors here.
      var errorCode = error.code;
      var errorMessage = error.message;
      console.log(error.code);
      console.log(error.message);
      // ...
    });

  };

  $scope.GoogleSignUp = function(){

    var provider = new firebase.auth.GoogleAuthProvider();

    firebase.auth().signInWithPopup(provider).then(function(result) {
      // This gives you a Google Access Token. You can use it to access the Google API.
      var token = result.credential.accessToken;
      // The signed-in user info.
      var user = result.user;
      // ...

      console.log(token);
      console.log(user);

    }).catch(function(error) {
      // Handle Errors here.
      var errorCode = error.code;
      var errorMessage = error.message;
      // The email of the user's account used.
      var email = error.email;
      // The firebase.auth.AuthCredential type that was used.
      var credential = error.credential;
      // ...
      console.log(error);
    });


  };

  $scope.FacebookSignUp = function (){
    
    var provider = new firebase.auth.FacebookAuthProvider();
    firebase.auth().signInWithPopup(provider).then(function(result) {
      // This gives you a Facebook Access Token. You can use it to access the Facebook API.
      var token = result.credential.accessToken;
      // The signed-in user info.
      var user = result.user;
      // ...
      console.log(token);
      console.log(user);
    }).catch(function(error) {
      // Handle Errors here.
      var errorCode = error.code;
      var errorMessage = error.message;
      // The email of the user's account used.
      var email = error.email;
      // The firebase.auth.AuthCredential type that was used.
      var credential = error.credential;
      // ...
      console.log(error);
    });

  };

  $scope.GoogleSignOut = function(){

    firebase.auth().signOut().then(function() {
      // Sign-out successful.
    }, function(error) {
      // An error happened.
    });

  };

  $scope.login = function(){
    Auth.$signInAnonymously().then(function(firebaseUser){
        $scope.user = firebaseUser;
      }).catch(function(error) {
        $scope.error = error;
      });
  };

  $scope.signOut = function(){
    Auth.$signOut()
  };

  $scope.auth.$onAuthStateChanged(function(firebaseUser){
    $scope.user = firebaseUser;
    //$route.reload();
    console.log("state change");
  });

  //console.log($scope.auth);
  //console.log($scope.currentAuth);
  //console.log(Auth.$requireSignIn());
}]);

app.controller("HomeCtrl", ["currentAuth", "$scope", "Auth", "$route", function(currentAuth, $scope, Auth, $route) {
  // currentAuth (provided by resolve) will contain the
  // authenticated user or null if not signed in

  $scope.signOut = function(){
    console.log($scope.user);
    Auth.$signOut();
  }

  Auth.$onAuthStateChanged(function(firebaseUser) {
    $scope.user = firebaseUser;
    console.log("HomeCtrl: state changed");
    //if user is logged out go back to login page
    if(firebaseUser === "" || firebaseUser === null){
      $route.reload();
    }
  });

  //$route.reload();
  console.log("HomeCtrl");
  //console.log($scope.currentAuth);
  //console.log(Auth.$requireSignIn());
}]);

app.controller("AccountCtrl", ["currentAuth", "$scope", "Auth", "$route", function(currentAuth, $scope, Auth, $route) {
  // currentAuth (provided by resolve) will contain the
  // authenticated user or null if not signed in

  $scope.auth = Auth;
    console.log("In Account Controller: ");
    console.log(currentAuth);
  $scope.signOut = function(){
    Auth.$signOut();
    $route.reload();
  };

  $scope.auth.$onAuthStateChanged(function(firebaseUser) {
    $scope.user = firebaseUser;
    //$route.reload();
    console.log("in account controller state change");
    if(firebaseUser === "" || firebaseUser === null){
      $route.reload();
    }  
  }); 

}]);

// let's create a re-usable factory that generates the $firebaseAuth instance
app.factory("Auth", ["$firebaseAuth",
  function($firebaseAuth) {
    return $firebaseAuth();
  }
]);