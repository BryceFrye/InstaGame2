$(function(){

  window.Photo = Backbone.Model.extend({
  });
  
  window.User = Backbone.Model.extend({
    url: function() {
      return 'https://api.instagram.com/v1/users/self?access_token='+token+'&callback=?';
    },
    parse: function(response) {
      return response.data;
    }
  });
  
  window.PhotoFeed = Backbone.Collection.extend({
    model: Photo,
    url: function() {
      return 'https://api.instagram.com/v1/users/self/feed?access_token='+token+'&callback=?&count=100';
    },
    parse: function(response) {
      return response.data;
    }
  });
  
  window.UserPhotos = Backbone.Collection.extend({
    model: Photo, 
    url: function() {
      return 'https://api.instagram.com/v1/users/self/follows?access_token='+token+'&callback=?';
    },
    parse: function(response) {
      return response.data;
    }  
  });
  
  window.ExpertPhotoFeed = Backbone.Collection.extend({
    model: Photo,
    url: function() {
			return 'https://api.instagram.com/v1/media/popular?access_token='+token+'&callback=?&count=100';
    },
    parse: function(response) {
      return response.data;
    }
  });
  
  window.PhotoView = Backbone.View.extend({
    tagName: "li",
    template: _.template($('#photo-template').html()), 
    initialize: function() {
      _.bindAll(this, 'render');
      this.render();
    },
    render: function() {
      $(this.el).html(this.template({ model: this.model }));
      return this;
    }
  });
  
  window.UserView = Backbone.View.extend({
    tagName: "span",
    template: _.template($('#user-template').html()),
    currentPhotoIndex: 0,
    events: {
      "click .user-photo" : "guess"
    },       
    initialize: function() {
      _.bindAll(this, 'render');
      this.render();
    },
    render: function() {
      $(this.el).html(this.template({ model: this.model }));
      return this;
    },
    guess: function() {
			window.App.trigger("guessedUser", this.model.get('user').username, this.$(".user-photo"));
    }
  });
  
  window.GameView = Backbone.View.extend({
    el: "#controls",
    loginTemplate: _.template($('#login-template').html()),
    playTemplate: _.template($('#play-template').html()),
    instructionsTemplate: _.template($('#instructions-template').html()),
    photoErrorTemplate: _.template($('#photo-error-template').html()),
    followErrorTemplate: _.template($('#follow-error-template').html()),
    scoreTemplate: _.template($('#score-template').html()),
		expertScoreTemplate: _.template($('#expert-score-template').html()),
		highScoresTemplate: _.template($('#high-scores-template').html()),
    currentPhoto: 0,
    events: {
			"click .difficulty": "setDifficulty"
    },
    initialize: function() {
      _.bindAll(this, 'render');
      this.bind("guessedUser", this.guessedUser);
      this.render();
    },   
    render: function() {
      if (token == "") {
        $(this.el).append(this.loginTemplate());
      } else {
        $(this.el).append(this.playTemplate());
				this.getUser();
      }
      $("#instructions-area").append(this.instructionsTemplate());
      return this;
    },
		setDifficulty: function(e){
			if (e.target.id === "easy"){
				this.difficulty = 3;
				this.pointsPossible = 200;
				this.mode = "normal";
			} else if (e.target.id === "hard"){
				this.difficulty = 5;
				this.pointsPossible = 400;
				this.mode = "normal";
			} else if (e.target.id === "expert"){
				$("#chances").show();
				this.difficulty = 4;
				this.chances = 3;
				this.photoCounter = 0;
				this.mode = "expert";
			}
			this.startGame();
		},
    startGame: function(){
      var self = this;
			this.score = 0;
      $("#difficulty").hide();
      $("#score").remove();
      $("#instructions").fadeOut('fast');
      $("#instructions-area").fadeOut('fast',function() {
        self.getPhotos();
      });
    },
    getUser: function(){
      var self = this;
      this.user = new User();
      this.user.fetch({success: function(model, response){
        $("#logout").show();
				self.current_user = self.user.get('username');
      }});
    },
    getPhotos: function(){
      var self = this;
      if (this.mode === "expert"){
        this.photoCollection = new ExpertPhotoFeed();
      } else {
        this.photoCollection = new PhotoFeed();
      }
      this.photoCollection.fetch({success: function(photos, response){
				photos.models.sort(function(){ return 0.5 - Math.random();});
        photos.models.forEach(function(photo){
          if (photo.get('user').username === self.current_user){
            photos.models = _.without(photos.models, photo);
            photo.destroy();
          } else {
            var row = new PhotoView({ model: photo });
            $("#photos").append(row.el);
          }
        });
        if ( photos.models.length > 9 ){
          $("#controls").slideUp('fast');
          $(".photo").hide();
          $(".photo:first").addClass("active").fadeIn('fast');
					self.getUsers();
        } else {
          self.notEnoughPhotos();
        }
      }});
    },
    notEnoughPhotos: function(){
      $("#photos li").remove();
      $("#instructions-area").fadeIn('fast');
      $("#instructions-area").append(this.photoErrorTemplate());
    },
    notFollowingEnough: function(){
      $("#photos li").remove();
      $("#user-photos span").remove();
      $("#instructions-area").fadeIn('fast');
      $("#instructions-area").append(this.followErrorTemplate());
    },
    getUsers: function(){
      var self = this;
			this.uniqueUsers = {};
      this.userCollection = [];
      this.photoCollection.models.forEach(function(photo){
				var username = photo.get('user').username;
        self.uniqueUsers[username] = photo;
      });
			for (key in this.uniqueUsers){
				this.userCollection.push(this.uniqueUsers[key]);
			}
      this.findUserPhoto();
    },
    findUserPhoto: function(){
      var self = this;
			if ((this.mode === "expert") && (this.currentPhoto === this.photoCollection.length)){
				this.currentPhoto = 0;
				this.getPhotos();
			} else {
				var userCollectionCopy = _.clone(this.userCollection);
	      userArray = [];
	      userCollectionCopy.forEach(function(photo){
	        var username = photo.get('user').username;
	        if (username === self.photoCollection.models[self.currentPhoto].get('user').username) {
						userArray.push(photo);
	          userCollectionCopy = _.without(userCollectionCopy, photo);
	        }
	      });
	      while ( userArray.length < this.difficulty ){
	        var randomNumber = Math.floor(Math.random() * userCollectionCopy.length);
	        userArray.push(userCollectionCopy[randomNumber]);
	        userCollectionCopy = _.without(userCollectionCopy, userCollectionCopy[randomNumber]);
	      }
				userArray.sort(function(){ return 0.5 - Math.random();});
	      userArray.forEach(function(photo) {
	        var userPhoto = new UserView({ model: photo, difficulty: self.difficulty, photoCollection: self.photoCollection });
	        $("#user-photos").append(userPhoto.el);
	      });
				if (this.mode === "normal" && this.currentPhoto > 9){
					this.resetGame();
		      $("#instructions-area").append(this.scoreTemplate({ score: this.score, total: this.pointsPossible }));
				}
			}
    },
    guessedUser: function(username, photo){
      var self = this;
      var photoUsername = this.photoCollection.models[this.currentPhoto].get('user').username;
      if ( username  === photoUsername ){
        this.currentPhoto++;
        if (this.difficulty === 3){
          self.score += 20;
        } else if (this.difficulty === 5){
          self.score += 40;
				} else if (this.mode === "expert"){
					self.score++;
					$("#rounds_cleared").html(self.score);
					if (self.score % 10 === 0){
						if (this.chances < 3){
							$(".active_strike:last").removeClass("active_strike").addClass("strike");
							this.chances++;
						}
					}
				}
        $("#guess-correct").fadeIn(100);
        $("#guess-correct").fadeOut(400, function(){
          $(".active").remove();
          $("#user-photos span").remove();
          $(".photo:first").addClass("active").fadeIn('fast');
          self.findUserPhoto();
        });
      } else {
        if (this.mode === "expert"){
          this.chances--;
					$(".strike:first").addClass("active_strike").removeClass("strike");
					if (this.chances <= 0){
						$("#guess-wrong").fadeIn(100);
		        $("#guess-wrong").fadeOut(400, function(){
							self.resetGame();
				      $("#instructions-area").append(self.expertScoreTemplate({ score: self.score }));
							$(".active_strike").removeClass("active_strike").addClass("strike");
							$("#chances").hide();
							$("#rounds_cleared").html("0");
						});
					}
        } else {
          this.score -= 10;
        }
        $("#guess-wrong").fadeIn(100);
        $("#guess-wrong").fadeOut(400);
        photo.addClass("incorrect_guess");
      }
    },
		resetGame: function(){
			$("#photos li").remove();
      $("#user-photos span").remove();
      $("#controls").slideDown('fast');
      $("#difficulty").show();
      $("#instructions-area").fadeIn("slow");
			this.currentPhoto = 0;
		}
	});
  
  window.App = new GameView;
  
});