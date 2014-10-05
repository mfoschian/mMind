var Game =
{
	positions: [0, 1, 2, 3],
	codes: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9' ],
	constraints:
	{
		allowAnyFirstCode: false,
		prohibitedFirsCode: 0,
		allowDuplicatedCodes: false
	},
	started: false,
	guesses: 0,
	solution: {}
};
function clearTable()
{
	var tb = document.getElementById('tboard');
	if( !tb ) return;
	
	var e=[], i;
	els = tb.getElementsByClassName('hintrow')
	for( i=0; i<els.length; i++ )
	{
		e.push(els[i]);
	}
	for( i=0; i<e.length; i++ )
	{
		tb.removeChild(e[i]);
	}
}
function newSolution()
{
	var c;
	if( !Game.constraints.allowDuplicatedCodes )
	{
		c = [];
		for( var ix = 0; ix < Game.codes.length; ix++ ) {  c.push( Game.codes[ix] ); }
		c.sort( function(a,b) { return Math.random() < 0.5 ? -1 : 1; } );
		if( !Game.constraints.allowAnyFirstCode && c[0] == Game.constraints.prohibitedFirsCode )
		{
			var co = c.shift();
			c.push(co);
		}
	}
	else
	{
		function randomCode()
		{
			return Game.codes[ Math.floor(Math.random()*Game.codes.length) ];
		}
		var code = randomCode();
		while( !Game.constraints.allowAnyFirstCode && code == Game.constraints.prohibitedFirsCode )
		{
			code = randomCode();
		}
		c = [ code ];
		for( var j = 1; j < Game.positions.length; j++ )
		{
			c.push( randomCode() );
		}
	}
	
	
	var s = {};
	for( var i=0; i<Game.positions.length; i++ )
	{
		var p = Game.positions[i];
		s[p] = { code: c[i], position: p };
	}
	
	return s;
}
function startGame()
{
	if( Game.started )
		clearTable();

	var sol = document.getElementById('solution');
	sol.maxLength = Game.positions.length;
	clearWrongSolution();

	Game.started = true;
	Game.guesses = 0

	Game.solution = newSolution();
	//console.log( 'Sol to guess: '+solution2str(Game.solution) );
	displayInput();
}
function getSolution()
{
	var el = document.getElementById('solution');
	if( !el ) return null;

	var value = el.value;
	
	var s = {};
	for( var i = 0; i < value.length; i++ )
	{
		var code = value[i];
		s[i] = { code: value[i], position: i };
	}
	s.length = value.length;
	return s;
}
function cloneSolution(s)
{
	var c = {};
	for( var i in s )
	{
		var e = s[i];
		c[i] = { code: e.code, position: e.position, status: e.status };
	}
	return c;
}

function getSolutionAffinity( a1, a2 )
{
	var s1 = cloneSolution( a1 );
	var s2 = cloneSolution( a2 );

	// Check out the blacks
	for( var i in Game.positions )
	{
		var pos = Game.positions[i];
		if( s1[pos].code == s2[pos].code )
		{
			s1[pos].status = 'black';
			s2[pos].status = 'black';
		}
	}
	
	function foreachNonBlack( sol, f )
	{
		for( var j in sol )
		{
			var s = sol[j];
			if( s.status == 'black' )
				continue;
			
			f(s);
		}
	}
	
	// Check out the white
	foreachNonBlack( s1, function(s)
	{
		foreachNonBlack( s2, function(ss)
		{
			if( !ss.status && ss.code == s.code )
			{
				s.status = 'white';
				ss.status = 'white';
			}
		});
	});
	
	var b = 0, w = 0;
	for( var k in s1 )
	{
		var s = s1[k];
		if( s.status == 'white' )
			w++;
		else if( s.status == 'black' )
			b++;
	}
	
	s1.blacks = b;
	s1.whites = w;
	return s1;
}


function solution2str(s)
{
	var p = '';
	for( var i in Game.positions )
	{
		var x = s[i];
		p += x.code;
		if( x.status == 'black' ) p+='b';
		else if( x.status == 'white' ) p+='w';
		else p+=' ';
	}
	
	return p;
}

function validate( solution )
{
	if( solution.length != Game.positions.length )
		return false;

	for( var i=0; i<solution.length; i++ )
	{
		var sol = solution[i];
		var found = false;

		for( var j=0; j<Game.codes.length; j++ )
		{
			var code = Game.codes[j];
			if( code == sol.code )
			{
				found = true;
				break;
			}
		}
		if( !found )
			return false;
	}

	return true;
}

function checkSolution()
{
	var s = getSolution();

	// Validate solution
	if( !validate(s) )
	{
		markWrongSolution();
		return;
	}

	//console.log( 'You say '+solution2str(s) );
	clearWrongSolution();

	var a = getSolutionAffinity( s, Game.solution );
	
	//console.log( 'Affinity: '+solution2str(a) );
	
	Game.guesses++;
	
	displayGuess( s, a );
	if( a.blacks == Game.positions.length )
		displayWin();
}
function displayGuess(s,a)
{
	var tb = document.getElementById('tboard');
	if( !tb ) return;

	var g = document.createElement('tr');
	g.className = 'hintrow';
	
	function addCell(html)
	{
		var td = document.createElement('td');
		td.innerHTML = html;
		g.appendChild(td);
	}
	addCell( Game.guesses );
	var str = '';
	for( var i in Game.positions )
	{
		var t = s[i];
		str += t.code;
	}
	addCell( str );

	str = '';
	for( var i in Game.positions )
	{
		var t = a[i];
		if( t.status == 'black' )
			str = 'O' + str;
		else if( t.status == 'white' )
			str = str + 'V';
	}
	addCell( str );

	tb.appendChild(g);
}
function displayInput()
{
	var inp = document.getElementById('gameinput');
	inp.style.display = 'block';
}
function hideInput()
{
	var inp = document.getElementById('gameinput');
	inp.style.display = 'none';
}
function markWrongSolution()
{
	var sol = document.getElementById('solution');
	sol.classList.add('wrong');
}
function clearWrongSolution()
{
	var sol = document.getElementById('solution');
	sol.classList.remove('wrong');
}
function displayWin()
{
	hideInput();
}