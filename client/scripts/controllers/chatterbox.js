/** * @class chatterboxCtrl
 * @description Controller for chat. Makes use of databaseAndAuth factory in order to retrieve/update chat messages from the databse.
*/
angular.module('myApp').controller('chatterboxCtrl', function($scope, $rootScope, $location, $http, databaseAndAuth) {

 var database = firebase.database();
   var ref = database.ref('twilioMessages');
   ref.on('value', gotData, errData);

   function gotData(data) {
    
    var twilioMessages = data.val();
    console.log('--------', data.val())
    // $scope.mapd3();
   }

   function errData(err) {
    console.log(err)
   }
 //default setting for recording button
 $scope.srcChange = "red.png";

 $scope.messageObj = {};
 /**
   * @function sendMessage
   * @memberOf chatterboxCtrl
   * @description Gets the user email and username from the database. Takes user input ($scope.text) and updates the database with that input. Each input is added to the user that submitted it.
 */
 $scope.sendMessage = function(userId, text) {
   var chatEmail = databaseAndAuth.auth.currentUser.email;
   var chatUsername = chatEmail.slice(0, chatEmail.indexOf('@'));
   
   var chatId = +new Date(Date()); //use time in milliseconds for chatId
   var ref = database.ref('twilioMessages');
   ref.on('value', gotData, errData);

   function gotData(data) {

    var twilioMessages = data.val();
    console.log('--------', data.val())

    var svg = d3.select(".graph").append("svg")
        .attr('width', 500)
        .attr('height', 300)
    svg = d3.select("svg"),
    margin = {top: 20, right: 20, bottom: 30, left: 40},
    width = +svg.attr("width") - margin.left - margin.right,
    height = +svg.attr("height") - margin.top - margin.bottom;

    var x = d3.scaleBand().rangeRound([0, width]).padding(0.1),
    y = d3.scaleLinear().rangeRound([height, 0]);

    var g = svg.append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    var data = [
      {letter: 'UK', frequency: '50'},
      {letter: 'USA', frequency: '2.14'},
      {letter: 'Palestine', frequency: '2.14'},
      {letter: 'France', frequency: '2.14'},
      {letter: 'Jordan', frequency: '2.14'},
      {letter: 'Syria', frequency: '2.14'},
      {letter: 'Lebanon', frequency: '2.14'},
      {letter: 'Brazil', frequency: '2.14'},
      {letter: 'Brazil', frequency: '2.14'},
      {letter: 'Brazil', frequency: '3.2'},
      {letter: 'Brazil', frequency: '2.14'},
      {letter: 'Brazil', frequency: '34.5'},
      {letter: 'Brazil', frequency: '9.12'},
      {letter: 'Brazil', frequency: '4.56'},

      ]
  var yScale = d3.scaleLinear()
    .range([height, 0]);
   yScale = yScale.domain([0, d3.max(data, function(d) { return d.frequency; } ) ]);

  data.forEach(function(d) {
    d.frequency = +d.frequency;
    return d; 
  })
  x.domain(data.map(function(d) { return d.letter; }));
  y.domain([0, d3.max(data, function(d) { return d.frequency; })]);
  console.log(y);

  g.append("g")
      .attr("class", "axis axis--x")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x));

  g.append("g")
      .attr("class", "axis axis--y")
      .call(d3.axisLeft().scale(yScale))
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", "0.71em")
      .attr("text-anchor", "end")
      .text("Frequency")
      .attr({"y": function(d){ return yScale(d.frequency); }});
      
  g.selectAll(".bar")
    .data(data)
    .enter().append("rect")
    .attr("height", 0)
    .attr("y", height)
    .transition().duration(3000)
    .delay( function(d,i) { return i * 200; })
      .attr("class", "bar")
      .attr("x", function(d) { return x(d.letter); })
      .attr("y", function(d) { return y(d.frequency); })
      .attr("width", x.bandwidth())
      .attr("height", function(d) { return height - y(d.frequency); });
   }

   function errData(err) {
    console.log(err)
   }
   database.ref('chats/' + chatId).set({
     username: chatUsername,
     text: $scope.text,
     createdAt: Date()
   });

   $scope.text = '';
 };
 /**
   * @function fetchMessage
   * @memberOf chatterboxCtrl
   * @description Gets all the chats from the database, attaches them to the scope, and then renders the updated scope ($scope.apply())
 */
$scope.binaryClient;
$scope.isRecording = null;
window.Stream;

$scope.mapd3 = function() {
  console.log('---------' , $scope.firebaseData);
  // we are going to make a request to the server side

}
 $scope.fetchMessage = function() {
   
   var ref = database.ref('chats');
   
   ref.limitToLast(9).on('value', function(chat) {
     $scope.messageObj = chat.val();
     $scope.$apply();
   });

 };

 $scope.recording = function(){
   var session = {
     audio: true,
     video: false
   };


   if ($scope.srcChange === "green.jpg") {
     $scope.srcChange = "red.png";
     window.Stream.end();

   } else {
     $scope.srcChange = "green.jpg";

     $scope.binaryClient = new BinaryClient('ws://localhost:9001');

     $scope.binaryClient.on('open', function() {
       window.Stream = $scope.binaryClient.createStream();

       if (!navigator.getUserMedia)
         navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia ||
       navigator.mozGetUserMedia || navigator.msGetUserMedia;

       if (navigator.getUserMedia) {
         navigator.getUserMedia({audio:true}, success, function(e) {
           alert('Error capturing audio.');
         });
       } else alert('getUserMedia not supported in this browser.');
       
 

       function success(e) {
         audioContext = window.AudioContext || window.webkitAudioContext;
         context = new audioContext();

         // the sample rate is in context.sampleRate
         audioInput = context.createMediaStreamSource(e);

         var bufferSize = 2048;
         recorder = context.createScriptProcessor(bufferSize, 1, 1);

         recorder.onaudioprocess = function(e){
          if ($scope.srcChange === 'red.png') {
             return;
          }
           console.log ('recording');
           var left = e.inputBuffer.getChannelData(0);
          
           window.Stream.write(convertoFloat32ToInt16(left));
          
         }

         audioInput.connect(recorder)
         recorder.connect(context.destination);
       }

       function convertoFloat32ToInt16(buffer) {
         var l = buffer.length;
         var buf = new Int16Array(l)

         while (l--) {
           buf[l] = buffer[l]*0xFFFF;    //convert to 16 bit
         }
         return buf.buffer
       }
     });
   }

 }

 $scope.hidePartial = function() {
   $rootScope.showMessages = false;
 }

});