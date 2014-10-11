var GameConfig =
{
	positions: [0, 1, 2, 3],
	codes: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9' ],
	constraints:
	{
		allowAnyFirstCode: false,
		prohibitedFirsCode: 0,
		allowDuplicatedCodes: false
	}
};

var Game =
{
	config: GameConfig,
	started: false,
	solution: null
};

var gui = new GUI( Game.config );


function newSolution()
{
	var c;
	var constraints = Game.config.constraints;
	var codes = Game.config.codes;

	if( !constraints.allowDuplicatedCodes )
	{
		c = [];
		for( var ix = 0; ix < codes.length; ix++ ) {  c.push( codes[ix] ); }
		c.sort( function(a,b) { return Math.random() < 0.5 ? -1 : 1; } );
		if( !constraints.allowAnyFirstCode && c[0] == constraints.prohibitedFirsCode )
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
		while( !constraints.allowAnyFirstCode && code == constraints.prohibitedFirsCode )
		{
			code = randomCode();
		}
		c = [ code ];
		for( var j = 1; j < Game.config.positions.length; j++ )
		{
			c.push( randomCode() );
		}
	}
	
	
	var s = {};
	for( var i=0; i<Game.config.positions.length; i++ )
	{
		var p = Game.config.positions[i];
		s[p] = { code: c[i], position: p };
	}
	
	return s;
}
function startGame()
{
	if( Game.started )
		gui.clearBoard();


	Game.started = true;

	Game.solution = newSolution();
	//console.log( 'Sol to guess: '+solution2str(Game.solution) );
	gui.init();
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
	for( var i in Game.config.positions )
	{
		var pos = Game.config.positions[i];
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
	if( solution.length != Game.config.positions.length )
		return false;

	for( var i=0; i<solution.length; i++ )
	{
		var sol = solution[i];
		var found = false;

		for( var j=0; j<Game.config.codes.length; j++ )
		{
			var code = Game.config.codes[j];
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


gui.on( 'makeGuess', function()
{
	var s = gui.getSolution();
	if(!Game.solution)
	{
		Game.solution = newSolution();
	}


	// Validate solution
	if( !validate(s) )
	{
		gui.markWrongSolution();
		return;
	}

	//console.log( 'You say '+solution2str(s) );
	gui.clearWrongSolution();

	var a = getSolutionAffinity( s, Game.solution );
	
	//console.log( 'Affinity: '+solution2str(a) );
	
	gui.addGuess( s, a );

	if( a.blacks == Game.config.positions.length )
		// END OF GAME
		gui.displayWin();

});

