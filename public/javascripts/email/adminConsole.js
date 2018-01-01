// Userlist data array for filling in info box
var emailQueueData = [];
var emailArchiveData = [];

// DOM Ready =============================================================
$(document).ready(function() {

	// populate the queue processing status on page laod
	// PopulateQueueProcessingStatus();

	// populate the queue table on page load
	// PopulateQueueTable();

	// // Populate the user table on initial page load
	// populateTable();

	// status toggle button clicked
	$('button#queue-processing_button').on('click', ToggleQueueProcessingStatus);

	// status toggle button clicked
	$('div#queue_list table tbody').on('click', 'td a.anchor_email-id', PopulateMessageDetails);



	

	// // Username link click
	// $('#userList table tbody').on('click', 'td a.linkshowuser', showUserInfo);

	// // Add User button click
	// $('#btnAddUser').on('click', addUser);

	// // Delete User link click
	// $('#userList table tbody').on('click', 'td a.linkdeleteuser', deleteUser);
});

// Functions =============================================================

// Fill table with data
function PopulateQueueTable () {

	// Empty content string
	var tableContent = '';

	// jQuery AJAX call for JSON
	$.getJSON( '/email/queue', function( data ) {

		// Stick our user data array into a userlist variable in the global object
		emailQueueData = data;

		// For each item in our JSON, add a table row and cells to the content string
		$.each(data, function(){
			tableContent +=	'<tr>' + 
							'	<td><a class="anchor_email-deletion" data-id="' + this._id + '">delete</a></td>' + 
							'	<td><a class="anchor_email-archival" data-id="' + this._id + '">archive</a></td>' + 
							'	<td><a class="anchor_email-id" data-id="' + this._id + '">' + this._id + '</a></td>';
			tableContent +=	typeof(this.to) !== 'undefined' ? '	<td>' +  this.to + '</td>' : '	<td></td>';
			tableContent +=	typeof(this.subject) !== 'undefined' ? '	<td>' +  this.subject + '</td>' : '	<td></td>';
			tableContent +=	typeof(this.nesoReceived) !== 'undefined' ? '	<td>' +  this.nesoReceived + '</td>' : '	<td></td>';
			tableContent +=	typeof(this.nesoSend) !== 'undefined' ? '	<td>' +  this.nesoSend + '</td>' : '	<td></td>';
			tableContent +=	'</tr>';
		});

		// Inject the whole content string into our existing HTML table
		$('div#queue_list table tbody').html(tableContent);
	});
};

function PopulateQueueProcessingStatus () {
	// jQuery AJAX call for JSON
	$.getJSON( '/email/processing', function( data ) {
		// Inject the whole content string into our existing HTML table
		$('p#queue-processing_status').text(data[0]["status"]);
	});
};

function PopulateMessageDetails () {

	// retrieve username from link rel attribute
	var thisMessageID = $(this).attr('data-id');

	// Get Index of object based on id value
	var arrayPosition = emailQueueData.map(function(arrayItem) { return arrayItem._id; }).indexOf(thisMessageID);

	// Get our User Object
	var thisMessageObject = emailQueueData[arrayPosition];

	// Populate Info Box
	$('div#queue_message-details input#queue_message-details_subject').val(thisMessageObject.subject);

};

function ToggleQueueProcessingStatus () {

	var currentStatus = '';
	var currentStatusID = '';
	var newStatus = {};

	// jQuery AJAX call for JSON
	$.getJSON( '/email/processing', function( data ) {
		// 
		currentStatus = data[0]["status"];
		currentStatusID = data[0]["_id"];

		if (currentStatus === "ON") {
			newStatus = { "status": "OFF" };
		} else {
			newStatus = { "status": "ON" };
		}

		// send POST request to adduser service
		$.ajax({
			type: 'PUT',
			data: newStatus,
			url: '/email/processing/' + currentStatusID,
			dataType: 'JSON'
		}).done(function( response ) {

			// Check for successful (blank) response
			if (response.msg === '') {

				// update the status on the screen
				PopulateQueueProcessingStatus();

			} else {

				// If something goes wrong, alert the error message that our service returned
				alert('Error: ' + response.msg);
			}
		});
	});

};





/*
// Show User Info
function showUserInfo(event) {

	// Prevent Link from Firing
	event.preventDefault();

	// Retrieve username from link rel attribute
	var thisUserName = $(this).attr('rel');

	// Get Index of object based on id value
	var arrayPosition = userListData.map(function(arrayItem) { return arrayItem.username; }).indexOf(thisUserName);

	// Get our User Object
	var thisUserObject = userListData[arrayPosition];

	// Populate Info Box
	$('#userInfoName').text(thisUserObject.fullname);
	$('#userInfoAge').text(thisUserObject.age);
	$('#userInfoGender').text(thisUserObject.gender);
	$('#userInfoLocation').text(thisUserObject.location);
};


// Add User
function addUser(event) {

	// Prevent button from doing anything else
	event.preventDefault();

	// Super basic validation - increase errorCount variable if any fields are blank
	var errorCount = 0;
	$('#addUser input').each(function(index, val) {
		if($(this).val() === '') { errorCount++; }
	});

	// Check and make sure errorCount's still at zero
	if(errorCount === 0) {

		// If it is, compile all user info into one object
		var newUser = {
			'username': $('#addUser fieldset input#inputUserName').val(),
			'email': $('#addUser fieldset input#inputUserEmail').val(),
			'fullname': $('#addUser fieldset input#inputUserFullname').val(),
			'age': $('#addUser fieldset input#inputUserAge').val(),
			'location': $('#addUser fieldset input#inputUserLocation').val(),
			'gender': $('#addUser fieldset input#inputUserGender').val()
		}

		// send POST request to adduser service
		$.ajax({
			type: 'POST',
			data: newUser,
			url: '/users/adduser',
			dataType: 'JSON'
		}).done(function( response ) {

			// Check for successful (blank) response
			if (response.msg === '') {

				// Clear the form inputs
				$('#addUser fieldset input').val('');

				// Update the table
				populateTable();

			}
			else {

				// If something goes wrong, alert the error message that our service returned
				alert('Error: ' + response.msg);
			}
		});
	}
	else {
		// If errorCount is more than 0, error out
		alert('Please fill in all fields');
		return false;
	}
};

// Delete User
function deleteUser(event) {

	// Prevent Link from Firing
	event.preventDefault();

	// Pop up a confirmation dialog
	var confirmation = confirm('Are you sure you want to delete this user?');

	// If the user confirmed
	if (confirmation === true) {

		// send DELETE request to the deleteuser service
		$.ajax({
			type: 'DELETE',
			url: '/users/deleteuser/' + $(this).attr('rel')
		}).done(function( response ) {

			// Check for a successful (blank) response
			if (response.msg === '') {
				// do nothing
			} else {
				alert('Error: ' + response.msg);
			}

			// Update the table
			populateTable();
		});
	
	} else {

		// If they said no to the confirm, do nothing
		return false;
	}
};
*/