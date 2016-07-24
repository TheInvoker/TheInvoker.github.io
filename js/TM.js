interval_id = -1;
play = false;
count = 0;

blank = "⊔";
accept = "A";
reject = "R";
left = "L";
right = "R";

$(function() {
	$("#clr_button").click(function() {
		$('#result').html('');
		end_animation();
	});
	
	$("#cmp_button").click(function() {
		var output = do_computation();
		if (output == 1) {
			$('#result').prepend('Accepted!');
			create_animation();
		}
		else if (output == 0) $('#result').prepend('Rejected!');
		else if (output == -1) $('#result').prepend('Stuck Looping!');
		else if (output == -2) $('#result').prepend('Reached Maximum Steps Allowed!');
		else if (output == -3) $('#result').prepend('Missing or Invalid Input!');
		else if (output == -4) $('#result').prepend('Unexpected Error Occured!');
	});
	
	$("#stp_button").click(function() {
		var frames = $('tr', '#result');
		var len = frames.length;
		if (count >= len) return;
		play = false;
		show_frame(frames, count);
	});
	
	$("#ply_button").click(function() {
		play = !play;
	});

	$("#rst_button").click(function() {
		count = 0;
		play = false;
		var frames = $('tr', '#result');
		show_frame(frames, count);
	});
});

function create_animation() {
	var frames = $('tr', '#result');
	var len = frames.length;
	if (len == 0) return;
	$('#animation_controls').css('display','');
	show_frame(frames, count);
    interval_id = setInterval(function() {
        if (count >= len) play = false;
		if (!play) return;
		show_frame(frames, count);
    }, 500);
}

function show_frame(frame_collection, frame) {
	$('#animation').html("<tr>" + frame_collection.eq(frame).html() + "</tr>");
	count += 1;
}

function end_animation() {
	if (interval_id != -1) clearInterval(interval_id);
	interval_id = -1;
	play = false;
	count = 0;
	$('#animation').html('');
	$('#animation_controls').css('display','none');
}

// returns:
// 1 = accept
// 0 = reject
// -1 = stuck looping
// -2 = timed out
// -3 = missing or invalid data
// -4 = unexpected error
function do_computation() {
	$('#result').html('');
	end_animation();
	
	var head = 0;
	var tape = $('#input_text').val().trim();
	var delta = get_delta();
	if (delta.length < 2) return -3;
	var state = delta[0][0];
	var head_previous = head;
	var step = 0;
	var step_limit = 1500;
	var j, t, t_state, t_next_state, t_char, t_overwrite_symbol, t_direction;
	var html = [];
	
	if (tape == "") tape += blank;
	html.push(append(tape, head, head, step, state, ""));

	while (state != accept && state != reject && step < step_limit) {
		for(j=0; j<delta.length; j+=1) {
			t = delta[j];
			t_state = t[0];
			t_next_state = t[1];
			t_char = t[2];
			t_overwrite_symbol = t[3];
			t_direction = t[4];
		
			if (state == t_state && t_char.indexOf(tape[head]) != -1) { 
				step += 1;
				
				if (t_overwrite_symbol != "") tape = tape.substring(0, head) + t_overwrite_symbol + tape.substring(head + 1);
				
				state = t_next_state;
				head_previous = head;
				
				if (t_direction == right) {
					head += 1;
					if (head == tape.length) tape += blank;
				}
				else if (head > 0) head -= 1;
				else if (step == 1) return -1;
				
				html.push(append(tape, head, head_previous, step, state, t_overwrite_symbol));
				break;
			}
		}
		
		if (j == delta.length) {
			state = reject;
			step += 1;
			html.push(append(tape, head, head_previous, step, state, ""));
			break;
		}
	}
	
	$('#result').html(html.join(""));
	
	if (state == accept) return 1;
	if (state == reject) return 0;
	if (step >= step_limit) return -2;
	return -4;
}

function get_delta() {
	var i;
	var count = 0;
	var delta = new Array();
	var delta_temp = $('#Q').val().split('\n');
	for(i=0; i<delta_temp.length; i+=1) {
		if (delta_temp[i].match("^(\\d+|A|R),(\\d+|A|R),[^,]+,[^,]?,(R|L)$")) {
			delta[count] = delta_temp[i].split(',');
			count += 1;
		} else if (delta_temp[i].trim() != "") {
			delta.length = 0;
			alert("Line: " + (i+1).toString() + " is invalid!");
			break;
		}
	}
	return delta;
}

function append(tape, head, head_previous, step, state, t_overwrite_symbol) {
	var str = "";
	str += "<tr>";
	str += "<td nowrap>Step=" + step.toString() + " State=" + state + " Head=" + head.toString() + "</td>";
	for (var i=0; i<tape.length; i+=1) {
		if (i==head) {
			str += "<td class='current_cell'>";
		} else if (i==head_previous && t_overwrite_symbol!="") {
			str += "<td class='changed_cell'>";
		} else {
			str += "<td>";
		}
		str += tape[i].toString();
		str += "</td>";
	}
	str += "</tr>";
	return str;
}