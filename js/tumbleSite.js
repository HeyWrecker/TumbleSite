var tumbleSiteApp = angular.module('tumbleSite',["ngSanitize", "ngRoute", "ngAnimate", "ui.bootstrap"]);

tumbleSiteApp.value('blogName', 'beta-heywrecker');
tumbleSiteApp.value('filterOptions', [{title: 'All', tag: 'portfolio'},{title: 'Graphic Design', tag: 'graphic design'},{title: 'Illustration', tag: 'illustration'},{title: 'Logo Design', tag: 'logo design'},{title: 'Photography', tag: 'photography'},{title: 'Web Design', tag: 'web design'}]);

tumbleSiteApp.filter('dateToISO', function() {
  return function(input) {
    input = new Date(input).toISOString();
    return input;
  };
});


tumbleSiteApp.filter('orderObjectBy', function() {
  return function(items, field, reverse) {
    var filtered = [];
    angular.forEach(items, function(item) {
      filtered.push(item);
    });
    filtered.sort(function (a, b) {
      return (a[field] > b[field] ? 1 : -1);
    });
    if(reverse) filtered.reverse();
    return filtered;
  };
});

tumbleSiteApp.config(function($routeProvider) {
  $routeProvider

  .when('/', {
    templateUrl: 'partials/home_blog.html'
  })
  .when('/blog', {
    templateUrl: 'partials/blog.html'
  })
  .when('/:postID/projects', {
    templateUrl: 'partials/projects.html',
    controller: 'projectDirectLinkController'
  })
   // Used only when no postID is clicked, ie. from the menu.
  .when('/projects', {
    templateUrl: 'partials/projects.html'
  })
  .otherwise({
       redirectTo: '/'
  });

});

// Instantiate the dataService factory. This is used by controllers to obtain data from Tumblr using YQL.
tumbleSiteApp.factory('dataService', function($http, $q, blogName, filterOptions) {
    
    var blogName        = blogName,
        filterOptions   = filterOptions,
        defaultFilter   = filterOptions,
        arBlog          = [],
        showGrid        = false;
    
    function to_trusted(html_code) {
        return $sce.trustAsHtml(html_code);
    };
    
    // Function used to model image data into a common format returned from the Tumblr query.
    function modelImageSet(responseData, filter, moduleName) {
        var posts             = responseData.post;
       
        if($.inArray(filter, filterOptions)) {
			var portfolioDataSet 	= {},
                projectCollection 	= {},
				projectIndex	 	= 0
            ;
            
            /* 
                If the post response length is GT 1, there are multiple Tumblr posts being returned so begin processing for the
                larger data structure.
            */
            if(posts != undefined && posts.length > 1) {
                
                for(var key1 in posts) {
                    
                    /*
                        If the photoset key exists, the post currently being processed contains more than one image. Model the data accordingly.
                    */
                    if(posts[key1]['photoset']) {

                        var imageSets 				= posts[key1].photoset
                            , caption       		= posts[key1]['photo-caption']
                            , tags          		= posts[key1]['tag']
                            , postID        		= posts[key1]['id']
                            , imageSetIndex 		= parseInt(key1)
                            , projectElementsIndex 	= parseInt(key1)
                            , projectIndex 			= parseInt(key1)
                            , projectID 			= ''
                            , previewURL 			= 'https://placehold.it/1200x800?text=Image+Not+Found'
                            , thumbURL				= 'https://placehold.it/75x75?text=Image+Not+Found'
                            , title 				= ''
                            , projectSet 			= []
                            , isPreviewSet          = 0;

                        for(var arrayIndex in imageSets['photo']) {
                           
                            if(imageSets['photo'][arrayIndex]['caption'] != '#hero-image' && (moduleName == 'projectGrid' || moduleName == 'projectLink')) {
                              
                                // Reset the project index.
                                if(currentImageSetIndex != imageSetIndex) {
                                    projectElementsIndex = 0;
                                }
                               
                                for(var photoURLIndex in imageSets['photo'][arrayIndex]['photo-url']) {
                                   
                                    var currentImageSetIndex = imageSetIndex;
                                    
                                    if(imageSets['photo'][arrayIndex]['photo-url'][photoURLIndex]['max-width'] == 1280 && isPreviewSet == 0) {
                                        previewURL = imageSets['photo'][arrayIndex]['photo-url'][photoURLIndex]['content'];
                                        isPreviewSet = 1
                                    }
                                    
                                    if(imageSets['photo'][arrayIndex]['photo-url'][photoURLIndex]['max-width'] == 1280) {
                                        projectSet.push({'elementID' :  projectElementsIndex, 'highResURL' : imageSets['photo'][arrayIndex]['photo-url'][0]['content'], 'thumbURL' : imageSets['photo'][arrayIndex]['photo-url'][5]['content'], 'photo-caption' :imageSets['photo'][arrayIndex]['caption']});
                                        projectElementsIndex = projectElementsIndex + 1;
                                    }
                                }

                            } else if (moduleName == 'carousel') {
                                // Reset the project index.
                                if(currentImageSetIndex != imageSetIndex) {
                                    projectElementsIndex = 0;
                                }
                                
                                for(var photoURLIndex in imageSets['photo'][arrayIndex]['photo-url']) {
                                    if(imageSets['photo'][arrayIndex]['photo-url'][photoURLIndex]['max-width'] == 1280 && isPreviewSet == 0) {
                                        previewURL = imageSets['photo'][arrayIndex]['photo-url'][photoURLIndex]['content'];
                                        isPreviewSet = 1
                                    }
                                    
                                    if(imageSets['photo'][arrayIndex]['photo-url'][photoURLIndex]['max-width'] == 1280) {
                                        projectSet.push({'elementID' :  projectElementsIndex, 'highResURL' : imageSets['photo'][arrayIndex]['photo-url'][0]['content'], 'thumbURL' : imageSets['photo'][arrayIndex]['photo-url'][5]['content'], 'photo-caption' :imageSets['photo'][arrayIndex]['caption']});
                                        projectElementsIndex = projectElementsIndex + 1;
                                    }
                                }
                            }
                            
                        }
                      
                        projectCollection[key1] = {
                            "index" :key1,
                            "postID" : postID,
                            "caption" : caption,
                            "tags"	: tags,
                            "previewURL" : previewURL,
                            "projectImages" : projectSet,
                            "photoSetIndex"     : imageSetIndex

                        }

                    /*
                        There is only a single image in the post, no photo-set array. We still want to maintain our data structure though so format the 
                        returned data indentically.
                    */
                    } else {

                            var photoSet            = posts[key1]['photo-url']
                            , caption       		= posts[key1]['photo-caption']
                            , tags          		= posts[key1]['tag']
                            , postID        		= posts[key1]['id']
                            , imageSetIndex 		= parseInt(key1)
                            , projectElementsIndex 	= 0
                            , projectIndex 			= parseInt(key1)
                            , projectID 			= ''
                            , previewURL 			= 'https://placehold.it/1200x800?text=Image+Not+Found'
                            , thumbURL				= 'https://placehold.it/75x75?text=Image+Not+Found'
                            , title 				= ''
                            , projectSet 			= [];

                            for(var key2 in photoSet) {

                                if(photoSet[key2]['max-width'] == 1280) {
                                    previewURL = photoSet[0]['content'];
                                    projectSet.push({'elementID' :  projectElementsIndex, 'highResURL' : photoSet[0]["content"], 'thumbURL' : photoSet[5]["content"], 'photo-caption' : caption});

                                }

                                if(photoSet[key2]['max-width'] == 75) {
                                    thumbURL = photoSet[key2]['content'];
                                }

                            }

                            projectCollection[key1] = {
                                "index"             : key1,
                                "postID"            : posts[key1]['id'],
                                "caption"           : posts[key1]['photo-caption'],
                                "tags"              : posts[key1]['tag'],
                                "previewURL"        : previewURL,
                                "projectImages"     : projectSet,
                                "photoSetIndex"     : imageSetIndex

                            }
                    }

                }//end loop 1
            
            // The post response contained one record. Model the data into the return format.
            } else if (posts != undefined && posts.length == undefined) {

                // Post response has multiple images.
                if(posts['photoset']) {
                   var imageSets 				= posts.photoset
                            , caption       		= posts['photo-caption']
                            , tags          		= posts['tag']
                            , postID        		= posts['id']
                            , imageSetIndex 		= 0
                            , projectElementsIndex 	= 0
                            , projectIndex 			= 0
                            , projectID 			= ''
                            , previewURL 			= 'https://placehold.it/1200x800?text=Image+Not+Found'
                            , thumbURL				= 'https://placehold.it/75x75?text=Image+Not+Found'
                            , title 				= ''
                            , projectSet 			= []
                            , isPreviewSet          = 0;
                    
                    for(var arrayIndex in imageSets['photo']) {
                       
                        if(imageSets['photo'][arrayIndex]['caption'] != '#hero-image' && (moduleName == 'projectGrid' || moduleName == 'projectLink')) {
                                
                            // Reset the project index.
                            if(currentImageSetIndex != imageSetIndex) {
                                projectElementsIndex = 0;
                            }
                                
                            for(var photoURLIndex in imageSets['photo'][arrayIndex]['photo-url']) {
                                
                                var currentImageSetIndex = imageSetIndex;
                                
                                if(imageSets['photo'][arrayIndex]['photo-url'][photoURLIndex]['max-width'] == 1280 && isPreviewSet == 0) {
                                    previewURL = imageSets['photo'][arrayIndex]['photo-url'][photoURLIndex]['content'];
                                    isPreviewSet = 1
                                }
                                
                                if(imageSets['photo'][arrayIndex]['photo-url'][photoURLIndex]['max-width'] == 1280) {
                                    projectSet.push({'elementID' :  projectElementsIndex, 'highResURL' : imageSets['photo'][arrayIndex]['photo-url'][0]['content'], 'thumbURL' : imageSets['photo'][arrayIndex]['photo-url'][5]['content'], 'photo-caption' :imageSets['photo'][arrayIndex]['caption']});
                                    projectElementsIndex = projectElementsIndex + 1;
                                }

                            }

                        } else if (moduleName == 'carousel') {
                        
                            // Reset the project index.
                            if(currentImageSetIndex != imageSetIndex) {
                                projectElementsIndex = 0;
                            }
                                
                            for(var photoURLIndex in imageSets['photo'][arrayIndex]['photo-url']) {
                                if(imageSets['photo'][arrayIndex]['photo-url'][photoURLIndex]['max-width'] == 1280 && isPreviewSet == 0) {
                                    previewURL = imageSets['photo'][arrayIndex]['photo-url'][photoURLIndex]['content'];
                                    isPreviewSet = 1
                                }
                                    
                                if(imageSets['photo'][arrayIndex]['photo-url'][photoURLIndex]['max-width'] == 1280) {
                                    projectSet.push({'elementID' :  projectElementsIndex, 'highResURL' : imageSets['photo'][arrayIndex]['photo-url'][0]['content'], 'thumbURL' : imageSets['photo'][arrayIndex]['photo-url'][5]['content'], 'photo-caption' :imageSets['photo'][arrayIndex]['caption']});
                                    projectElementsIndex = projectElementsIndex + 1;
                                }
                            }
                        }
                            
                    }

                    
                    projectCollection[0] = {
                        "index" :0,
                        "postID" : postID,
                        "caption" : caption,
                        "tags"	: tags,
                        "previewURL" : previewURL,
                        "projectImages" : projectSet,
                        "photoSetIndex"     : imageSetIndex

                    }

                // Post response only has one image.   
                } else {
                    var photoSet                = posts['photo-url']
                        , caption       		= posts['photo-caption']
                        , tags          		= posts['tag']
                        , postID        		= posts['id']
                        , imageSetIndex 		= 0
                        , projectElementsIndex 	= 0
                        , projectIndex 			= 0
                        , projectID 			= ''
                        , previewURL 			= 'https://placehold.it/1200x800?text=Image+Not+Found'
                        , thumbURL				= 'https://placehold.it/75x75?text=Image+Not+Found'
                        , title 				= ''
                        , projectSet 			= [];


                    // Loop through for preview image URL.
                    for(var key1 in photoSet) {

                        if(photoSet[key1]['max-width'] == 1280) {
                            previewURL = photoSet[0]['content'];
                            projectSet.push({'elementID' :  projectElementsIndex, 'highResURL' : photoSet[0]["content"], 'thumbURL' : photoSet[5]["content"], 'photo-caption' : caption});

                        }

                        if(photoSet[key1]['max-width'] == 75) {
                            thumbURL = photoSet[key1]['content'];
                        }

                    }

                    projectCollection[0] = {
                        "index"                 : 0,
                        "postID"                : postID,
                        "caption"               : caption,
                        "tags"                  : tags,
                        "previewURL"            : previewURL,
                        "projectImages"         : projectSet,
                        "photoSetIndex"         : imageSetIndex

                    }
                   
               }
            }
	
			portfolioDataSet = {
				'filter': filter,
				'portfolioSets': projectCollection
			}

		  arBlog                = portfolioDataSet;
		  arBlog.showGrid       = true;
          arBlog.filterOptions  = filterOptions;
          return portfolioDataSet;
		}//end if
    };
    
    // Model blog (text or link) data into a common format returned from the Tumblr query.
    function modelData(responseData, filter, start, returnCount) {
        var posts               = responseData.post,
            blogDataSet         = {},
            tmpDataSet          = {},
			blogRecords         = {},
			dataSetIndex        = 0,
            nextStart           = start + returnCount,
            prevStart           = start - returnCount,
            displayNextStart    = (nextStart > responseData['total']) ? false : true,
            displayPrevStart    = (start == 0) ? false : true;
        
            if(prevStart < 0) {
                prevStart = 0;
            }
        
            // Check to see if the posts variable has returned an array of posts  and if so, normalize the data.
            if( Object.prototype.toString.call( posts ) === '[object Array]' ) {
                for(var key1 in posts) {

                    if(posts[key1].type == "regular") {

                        var tmpSummary     = posts[key1]['regular-body'],
                            summary        = $(tmpSummary).text().substring(0,200);

                        if(summary.length > 0) {
                            summary = summary + ' ...'
                        } else {
                            summary = '';
                        }

                        tmpDataSet[key1] = {
                            'index'           : dataSetIndex,
                            'title'           : posts[key1]['regular-title'],
                            'date'            : posts[key1]['date'],
                            'body'            : posts[key1]['regular-body'],
                            'summary'         : summary,
                            'postURL'         : posts[key1]['url-with-slug'],
                            'linkURL'         : '',
                            'publishState'    : posts[key1]['state'],
                            'postType'        : posts[key1]['type'],
                            'uID'             : posts[key1]['id']    
                        }

                    } else if(posts[key1].type == "link") {

                        var tmpSummary     = posts[key1]['link-description'],
                            summary        = $(tmpSummary).text().substring(0,200);

                        if(summary.length > 0) {
                            summary = summary + ' ...'
                        } else {
                            summary = '';
                        }

                        tmpDataSet[key1] = {
                            'index'           : dataSetIndex,
                            'title'           : posts[key1]['link-text'],
                            'date'            : posts[key1]['date'],
                            'body'            : posts[key1]['link-description'],
                            'summary'         : summary,
                            'postURL'         : posts[key1]['url-with-slug'],
                            'linkURL'         : posts[key1]['link-url'],
                            'publishState'    : posts[key1]['state'],
                            'postType'        : posts[key1]['type'],
                            'uID'             : posts[key1]['id']        

                        }

                    }

                    if(posts[key1].type == 'text' || posts[key1].type == 'link') {
                        dataSetIndex = dataSetIndex + 1;
                    }

                }//end loop
            
            // Otherwise, only a single post was returned so the data is not in an array. Normalize the data.
            } else {
                
                    // begin
                    if(posts.type == "regular") {

                        var tmpSummary     = posts['regular-body'],
                            summary        = $(tmpSummary).text().substring(0,200);

                        if(summary.length > 0) {
                            summary = summary + ' ...'
                        } else {
                            summary = '';
                        }

                        tmpDataSet[0] = {
                            'index'           : dataSetIndex,
                            'title'           : posts['regular-title'],
                            'date'            : posts['date'],
                            'body'            : posts['regular-body'],
                            'summary'         : summary,
                            'postURL'         : posts['url-with-slug'],
                            'linkURL'         : '',
                            'publishState'    : posts['state'],
                            'postType'        : posts['type'],
                            'uID'             : posts['id']    
                        }

                    } else if(posts.type == "link") {

                        var tmpSummary     = posts['link-description'],
                            summary        = $(tmpSummary).text().substring(0,200);

                        if(summary.length > 0) {
                            summary = summary + ' ...'
                        } else {
                            summary = '';
                        }

                        tmpDataSet[0] = {
                            'index'           : dataSetIndex,
                            'title'           : posts['link-text'],
                            'date'            : posts['date'],
                            'body'            : posts['link-description'],
                            'summary'         : summary,
                            'postURL'         : posts['url-with-slug'],
                            'linkURL'         : posts['link-url'],
                            'publishState'    : posts['state'],
                            'postType'        : posts['type'],
                            'uID'             : posts['id']        

                        }

                    }
                // end
            }
        
        blogDataSet = {
            'filter': filter,
			'newsBlog': tmpDataSet,
            'nextStart': nextStart,
            'prevStart': prevStart,
            'displayNextStart': displayNextStart,
            'displayPrevStart': displayPrevStart
        }
			
	    arBlog = blogDataSet;
        return blogDataSet;
	};
    
    // Submits a query using YQL to the Tumblr data collection on Yahoo.
    function dataService(moduleName, postsType, tagFilter, start, returnCount, postID) {
        
        var self = this;
  
        self.data = {};
        
        self.getData = function(moduleName, postsType, tagFilter, start, returnCount, postID) {
          
            var deferred = $q.defer(),
                yqlURL   = "http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20tumblr.posts%20where%20username%3D'"+blogName+"'%20AND%20type%3D'"+postsType+"'%20AND%20tagged%20%3D%20'"+tagFilter+"'%20AND%20num%20%3D%20'" + returnCount + "'%20AND%20start%20%3D%20'"+start+"'&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys&callback=JSON_CALLBACK";
            
            if(postID != undefined) {
                yqlURL   = "http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20tumblr.posts%20where%20username%3D'"+blogName+"'%20AND%20id%3D'"+postID+"'&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys&callback=JSON_CALLBACK";
            }
            
            // Use start="x" and num="y" as arguments to determine the start row and the number of entries.
            // num=0 returns all entries
            
            $http.jsonp(yqlURL)
                .success(function (data, status, headers, config) {
                   
                    if(data.query.results !== null) {
                        if(tagFilter == 'blogpost') {
                            var dataSet = modelData(data.query.results.posts, tagFilter, start, returnCount);
                        } else {
                            var dataSet = modelImageSet(data.query.results.posts, tagFilter, moduleName);
                        }

                    }
                
                    self.data = dataSet;
                    deferred.resolve(dataSet);


            })
                .error(function (data, status, headers, config) {
                    deferred.reject(data);

            });

            return deferred.promise;
        }
    }
    return new dataService();
});


/////////////////////////////////                         CONTROLLERS                         /////////////////////////////////  

// Controller for the carousel module used on the homepage partial. 
tumbleSiteApp.controller('slideHeroController', ['$scope', 'dataService', function($scope, dataService) {

    $scope.data = {};

    $scope.callLoadSlides = function(moduleName, postsType, tagFilter, start, returnCount) {
        
        dataService.getData(moduleName, postsType, tagFilter, start, returnCount)
            .then(
                function(data) {
                    
                    $scope.data             = data.portfolioSets;
                    $scope.slideInterval    = 5000;
                    var slides              = $scope.slides = [];
                    
                    $scope.addSlide = function(imageURL, postID) {
                        slides.push({
                           image: imageURL,
                           postID: postID
                        });
                    };
                    
                    for(key1 in $scope.data) {
                        if(key1 !== 'slug') {
                           
                            for(key2 in $scope.data[key1]) {
                                //If the second element in the data structure is the projectImages object...
                                if(key2 == 'projectImages') {
                                   
                                    // Loop over the individual image objects
                                    for(key3 in $scope.data[key1][key2]) {
                                        
                                        // Assign the data to a local variable and if the photo-caption key is #hero-image, add it to the slideshow.
                                        var imageObject = $scope.data[key1][key2][key3];
                                        
                                        if(imageObject['photo-caption'] == '#hero-image') {
                                            $scope.addSlide(imageObject['highResURL'],$scope.data[key1]['postID']);
                                        }
                                    }
                                    
                                }
                            }
                            
                        }
                       
                    }
                },
                function(response) {
                    console.log('error');
                    console.log('response');
                }
            );
        
    };
    
}]);

// Carousel controller that directs the user to the projects page with a specific postID
tumbleSiteApp.controller('carouselClickController', ['$scope', '$location', function($scope, $location) {
     $scope.go = function (event, postID, path) {
        $location.path(postID + path);
     }
}]);

// Controller that's called by the routeProvider when a postID exists for the projects route. Currently used in the home_blog partial in the carousel.
tumbleSiteApp.controller('projectDirectLinkController', ['$modal', '$scope', '$routeParams', '$q', '$http', 'blogName', 'dataService', function($modal, $scope, $routeParams, $q, $http, blogName, dataService) {
 
   var  moduleName  = 'projectLink',
        postsType   = 'photo',
        tagFilter   = 'portfolio',
        postID      = $routeParams.postID,
        start       = 0,
        returnCount = 1, 
        reloadModal = 1;
    
    // Listen for the event emitted by the modalOnChange directive that is triggered when a user selects a new category from the projects select box.
    $scope.$on('projectTypeChangeComplete', function() {
        
        // If the event was emitted, set the reloadModal value to false.
        reloadModal = 0;
    });
    
    // Listen for the loadComplete event before performing the look-up and set-up for the direct link project element.
    $scope.$on('loadComplete', function() {
        
        if(postID > 0 && reloadModal == 1) {
        
            dataService.getData(moduleName, postsType, tagFilter, start, returnCount, postID)
                .then(
                    function(data) {
                        $scope.arBlog           = data;

                        // Set the modal animation parameter to false to address this bug: https://github.com/angular-ui/bootstrap/issues/3633
                        if($scope.arBlog != undefined) {
                            $scope.animatesEnabled = true;
                            var modalInstance = $modal.open({
                                animation: $scope.animatesEnabled,
                                templateUrl: 'portfolioModal.html',
                                controller: 'directLinkModalInstanceController',
                                resolve: {

                                    portfolioElement: function() {
                                        return $scope.arBlog;  
                                    }
                                }
                            });
                        }

                    },
                    function(response) {
                        console.log('error');
                        console.log('response');
                    }
            );
        }
        
    });
    
    

    
}]);

// Controller used in the blog partial for loading and returning data to it.
tumbleSiteApp.controller('blogController', ['$scope', 'dataService', function($scope, dataService) {
    $scope.data = {};
    
    $scope.loadData = function(moduleName, postsType, tagFilter, start, returnCount) {
        dataService.getData(moduleName, postsType, tagFilter, start, returnCount)
            .then(
                function(data) {

                    $scope.arBlog              = data;

                },
                function(response) {
                    console.log('error');
                    console.log('response');
                }
            );


    };
    
}]);

// Controller used in the home_blog partial for loading and returning blog posts to it.
tumbleSiteApp.controller('homeBlogController', ['$scope', '$http', 'dataService', '$rootScope', function($scope, $http, dataService, $rootScope) {
    $scope.data = {};
   
    $scope.loadData = function(moduleName, postsType, tagFilter, start, returnCount) {
        dataService.getData(moduleName, postsType, tagFilter, start, returnCount)
            .then(
                function(data) {

                    $scope.arBlog               = data;
                    $scope.quantity             = 2;
                    
                     $rootScope.$on('loadComplete', function() {
                       $('#articleList').fadeIn( "400", function() {});
                     });
                     
                },
                function(response) {
                    console.log('error');
                    console.log('response');
                }
            );
        
    };
    
}]);

// Controller used in the projects partial for loading and returning the image / project data to it.
tumbleSiteApp.controller('projectsController', ['$scope', 'dataService', function($scope, dataService) {

    var postsType = 'photo';
    var tagFilter = 'portfolio';
    
    $scope.loadData = function(moduleName, postsType, tagFilter, start, returnCount) {
        dataService.getData(moduleName, postsType, tagFilter)
            .then(
                function(data) {
                   
                    $scope.arBlog               = data;
                    $scope.defaultFilter        = data.filterOptions;
                    $scope.selectOptions        = data.filterOptions;
                    $scope.selectedOption       = data.filterOptions[0];
                    
                    for(key1 in data.filterOptions) {
                        if(tagFilter == data.filterOptions[key1].tag) {
                            $scope.selectedOption = data.filterOptions[key1];
                        }
                    }

                },
                function(response) {
                    console.log('error');
                    console.log('response');
                }
            );
        
    };
    
}]);

// Controller used in the projects partial for loading the modal used to display the project whose thumbnail was clicked.
tumbleSiteApp.controller('modalController', ['$scope', '$modal', '$controller', function($scope, $modal, $controller) {
    
   
    $scope.open = function (event, portfolioObject, portfolioElement) {
        
        var currentTarget = $(event.currentTarget),
            nextTarget = $(event.delegateTarget).parent().next().children(),
            prevTarget = $(event.delegateTarget).parent().prev().children();
        
        $scope.portfolioObject  = portfolioObject;
        $scope.portfolioElement = portfolioElement;
        $scope.currentTarget = currentTarget;
        $scope.nextTarget    = nextTarget;
        $scope.prevTarget    = prevTarget;
        $scope.animatesEnabled = true;

        var modalInstance = $modal.open({
            animation: $scope.animatesEnabled,
            templateUrl: 'portfolioModal.html',
            controller: 'modalInstanceController',
            resolve: {
                
                portfolioObject: function() {
                  return $scope.portfolioObject;  
                },

                portfolioElement: function() {
                  return $scope.portfolioElement;  
                },
                
                currentTarget: function() {
                    return $scope.currentTarget;
                },
                
                nextTarget: function() {
                  return $scope.nextTarget;
                },
                
                prevTarget: function() {
                  return $scope.prevTarget;
                }
            }
        });

    };

}]);

// Controller used in the projects partial for loading the modal used to display a project via a direct project link (ex: /123456/projects)
tumbleSiteApp.controller('directLinkModalInstanceController', ['$scope', '$modalInstance', 'portfolioElement', function($scope, $modalInstance, portfolioElement) {
    $scope.arProject            = portfolioElement.portfolioSets[0];
    $scope.image                = $scope.arProject.previewURL;
    $scope.projectImages        = $scope.arProject.projectImages;
    $scope.caption              = $scope.arProject.caption;
    
    $scope.changeImage = function(elementID, viewPortElement) {
        
        $scope.image = $scope.projectImages[elementID]['highResURL'];
        
    }
    
}]);

// Instance controller for controls within the modal.
tumbleSiteApp.controller('modalInstanceController', ['$scope', '$modalInstance', 'portfolioObject','portfolioElement', 'currentTarget', 'nextTarget', 'prevTarget', function($scope, $modalInstance, portfolioObject, portfolioElement, currentTarget, nextTarget, prevTarget) {
    $scope.currentTarget     = currentTarget.attr('id');
    $scope.nextTarget        = nextTarget.attr('id');
    $scope.prevTarget        = prevTarget.attr('id');
    $scope.arProject	 	 = portfolioObject[$scope.currentTarget];
    $scope.portfolioObject   = portfolioObject[$scope.currentTarget];
    $scope.image			 = $scope.arProject.previewURL;
    $scope.projectImages	 = $scope.arProject.projectImages;
    $scope.caption			 = $scope.arProject.caption;
    
    $scope.changeImage = function(elementID, viewPortElement) {
        
        $scope.image            = $scope.projectImages[elementID]['highResURL'];
        $scope.photoCaption     = $scope.projectImages[elementID]['photo-caption'];

    }
    
}]);

// Controller used on the blog and home_blog partials for displaying the full version of the text post.
tumbleSiteApp.controller('blogDetailController', ['$scope', '$controller', '$filter', function($scope, $controller, $filter) {
    
    $scope.open = function (event, blogObject, blogElement, action) {

        var currentTarget       = $(event.currentTarget);
        var nextTarget          = $(event.delegateTarget).parent().next().children();
        var prevTarget          = $(event.delegateTarget).parent().prev().children();
        
        $scope.blogObject       = blogObject;
        $scope.blogElement      = blogElement;
        $scope.currentTarget    = currentTarget;
        $scope.nextTarget       = nextTarget;
        $scope.prevTarget       = prevTarget;
        $scope.action           = action;
        
        if(action == 'open') {
            var formattedDate       = $filter('date')($filter('dateToISO')(blogElement['date']), 'short');
            
            $('#articleList').hide();
            $('#articleDetail').show();
            $('#detailHeader').html(blogElement['title']);
            $('#detailDate').attr('datetime', blogElement['date']);
            $('#detailDate').html(formattedDate);
            $('#detailBody').html(blogElement['body']);

        } else {
            $('#articleDetail').hide();
            $('#articleList').show();
            $('#detailHeader').html('');
            $('#detailDate').attr('datetime', '');
            $('#detailDate').html('');
            $('#detailBody').html('');
        }
    };
}]);

tumbleSiteApp.directive('animateOnChange', function($animate, $compile) {
	var watchers = {};
    
    return {
		restrict: 'A',
		link: function($scope, element, attrs) 
        {
            // deregister `$watch`er if one already exists
			watchers[$scope.$id] && watchers[$scope.$id]();  
			watchers[$scope.$id] = $scope.$watch(attrs.animateOnChange, function(newValue, oldValue) 
			{   
                var overlayID = attrs['overlayName'];
                
                $(overlayID).modal({show: true, keyboard: false, backdrop: 'static'});
                
                // Set the watched element (portfolioGrid) to intitially not display.
                $(element).css('display', 'none');
                
                /* 
                 	If the new watched value is different from the old watched value, meaning that the watched data model has changed...
                */
                if (newValue !== oldValue) {
                    
                    // If the watched element (portfolioGrid) is currently not displayed...

					if($(element).css('display') == 'none') {
                       
                        // Hide the loading overlay.
                		$(overlayID).modal('hide');
                        $(overlayID).css('display: block;');
                		
                        // Once the loading modal is hidden, fade in the watched element (portfolioGrid).
                        $(overlayID).on('hidden.bs.modal', function (e) {
                            $(element).fadeIn( "400", function() {});
                            $scope.$emit('loadComplete');
                       })
            		} else {
                
                        $(element).fadeOut( "400", function() {
                            // Animation complete
                            $(element).fadeIn( "400", function() {
                            
                                // Animation complete
                            });
                            $scope.$emit('loadComplete');
                        });

             		}
				}
			});
		}
	}
});

/*************************************** Used to correct an issue with ng-animate interfering with carousel *****************************************/
tumbleSiteApp.directive('disableAnimation', function($animate){
    return {
        restrict: 'A',
        link: function($scope, $element, $attrs){
            $attrs.$observe('disableAnimation', function(value){
                $animate.enabled(!value, $element);
            });
        }
    }
});

/****************************************************************************************************************************************************/
tumbleSiteApp.directive('modalOnChange', function($animate, $compile) {
	var watchers = {};
	return {
		restrict: 'A',
		link: function($scope, element, attrs) 
        {
			// deregister `$watch`er if one already exists
			watchers[$scope.$id] && watchers[$scope.$id]();  
			watchers[$scope.$id] = $scope.$watch(attrs.modalOnChange, function(newValue, oldValue) 
			{   
                var overlayID = attrs['overlayName'];
                // Load the loading modal.
                $(overlayID).modal({show: true, keyboard: false, backdrop: 'static'});
                
                // Emit this event when neither the old nor the new values are undefined. That means a user actively changed the project type / category.
                if(oldValue != undefined && newValue != undefined) {
                    
                    // The projectDirectLinkController listens for this event and uses it to determine when to show the project modal.
                    $scope.$emit('projectTypeChangeComplete');
                }
			});
		}
	}
});