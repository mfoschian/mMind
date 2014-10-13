function GUI( options )
{
	this.config = options;
	this.guesses = 0;

	this.events = {};
	this.on = function( name, callback )
	{
		if( typeof(callback) != 'function' )
			return;

		this.events[name] = callback;
	};
	this.getEvent = function( name )
	{
		return this.events[name];
	};
	this.fireEvent = function( name, args )
	{
		var f = this.getEvent(name);
		if( f )
			f( args );
	};

	var me = this;
	
	this.setup = function()
	{
		this.makeInputWidget();
		
		this.clearWrongSolution();
		this.guesses = 0;
	};
	this.clearBoard = function()
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
	};

	this.getSolution = function()
	{
		var el = document.getElementById('solution');
		if( !el ) return this.getSolution2();

		var value = el.value;
		
		var s = {};
		for( var i = 0; i < value.length; i++ )
		{
			var code = value[i];
			s[i] = { code: value[i], position: i };
		}
		s.length = value.length;
		return s;
	};
	this.getSolution2 = function()
	{
		var s = { length: 0 };
		var poss = this.config.positions;
		for( var i=0; i<poss.length; i++ )
		{
			var pos = poss[i];
			var code = document.getElementById('code'+pos);
			if(!code) continue;
			
			var code_value = code.innerHTML;
			s[i] = { code: code_value, position: pos };
			s.length++;
		}
			
		return s;
	};


	this.makeSpan = function( html, klass )
	{
		return '<span class="'+(klass||'digit')+'">'+html+'</span>';
	}

	this.addGuess = function(s,a)
	{
		var tb = document.getElementById('tboard');
		if( !tb ) return;

		//var g = document.createElement('tr');
		var g = tb.insertRow(g);

		g.className = 'hintrow';
		
		function addCell(html)
		{
			var td = document.createElement('td');
			td.innerHTML = html;
			g.appendChild(td);
		}
		this.guesses++;
		addCell( this.guesses );
		var str = '';
		for( var i in this.config.positions )
		{
			var t = s[i];
			str += this.makeSpan(t.code,'digit');
		}
		addCell( str );

		str = '';
		for( var i in this.config.positions )
		{
			var t = a[i];
			if( t.status == 'black' )
				str = this.makeSpan('O','digit') + str;

			else if( t.status == 'white' )
				str = str + this.makeSpan('V','digit');
		}
		addCell( str );

		//tb.appendChild(g);
	};
	this.displayInput = function()
	{
		var inp = document.getElementById('gameinput');
		if( inp ) inp.style.display = 'block';
	};
	this.hideInput = function()
	{
		var inp = document.getElementById('gameinput');
		if( inp ) inp.style.display = 'none';
	};
	this.showNewGame = function()
	{
		var inp = document.getElementById('resetgame');
		if( inp ) inp.style.display = 'block';
	};
	this.hideNewGame = function()
	{
		var inp = document.getElementById('resetgame');
		if( inp ) inp.style.display = 'none';
	};
	this.markWrongSolution = function()
	{
		var sol = document.getElementById('codebox');
		if( sol ) sol.classList.add('wrong');
	};
	this.clearWrongSolution = function()
	{
		var sol = document.getElementById('codebox');
		if( sol ) sol.classList.remove('wrong');
	};
	this.displayWin = function()
	{
		this.hideInput();
		this.showNewGame();
	};

	// Input Widget management
	this.makeInputWidget = function()
	{
		var container = document.getElementById('pad');
		if( !container )
		{
			console.log('pad div not found');
			return;
		}

		var div = document.getElementById('gameinput');
		if( div ) return;

		div = document.createElement('div');
		div.id = 'gameinput';
		
		var codebox = document.createElement('div');
		codebox.id = 'codebox';
		
		var poss = this.config.positions;
		
		for( var i=0; i<poss.length; i++ )
		{
			var pos = poss[i];
			var code = document.createElement('span');
			code.id = 'code'+pos;
			code.setAttribute('posindex', i);
			code.innerHTML = '_';
			code.onclick = function() { me.selectCodePos( this.getAttribute('posindex') ); }
			codebox.appendChild(code);
		}

		div.appendChild(codebox);
		
		var codeboard = document.createElement('div');
		codeboard.id = 'codeboard';
		
		var codes = this.config.codes;
		for( var i=0; i<codes.length; i++ )
		{
			if( i == (codes.length/2) )
				codeboard.appendChild(document.createElement('p'));
			
			var c = codes[i];
			var code = document.createElement('span');
			code.innerHTML = c;
			code.setAttribute('codevalue',c);
			code.onclick = function() { me.onCodeClick( this.getAttribute('codevalue') ); }
			codeboard.appendChild(code);
		}

		codeboard.appendChild(document.createElement('p'));

		var but = document.createElement('div');
		but.className = 'makeGuess';
		but.innerHTML = 'OK';
		but.onclick = function() { me.fireEvent('makeGuess'); };
		codeboard.appendChild(but);

		div.appendChild(codeboard);
		

		container.appendChild(div);
	};
	
	this.currentposIx = 0;
	this.currentPos = function()
	{
		return this.config.positions[this.currentposIx];
	};
	this.selectCodePos = function(ixa)
	{
		var ix = parseInt(ixa);
		if( isNaN(ix) ) return;

		var newp = this.config.positions[ix];
		var oldp = this.config.positions[this.currentposIx];

		this.delightPos( oldp );
		this.currentposIx = ix;
		this.hilightPos( newp );
	};
	this.setCodePos = function(pos, code )
	{
		var el = document.getElementById('code'+pos);
		if( !el )
			return;
		
		el.innerHTML = code;
		el.setAttribute('codevalue',code);
	};
	this.hilightPos = function(pos)
	{
		var el = document.getElementById('code'+pos);
		if( el )
			el.classList.add('hi');
	};
	this.delightPos = function(pos)
	{
		var el = document.getElementById('code'+pos);
		if( el )
			el.classList.remove('hi');
	};
	this.onCodeClick = function( code )
	{
		console.log('clicked '+code);
		
		var newIx = this.currentposIx + 1;
		if( newIx >= this.config.positions.length )
			newIx = 0;

		this.setCodePos( this.currentPos(), code );
		this.selectCodePos( newIx );
	};

	this.resize = function(ev)
	{
		var b = document.body;
		var w = b.clientWidth;
		var h = b.clientHeight;
		console.log( w, h );

		var board = document.getElementById('board');
		var pad = document.getElementById('pad');
		if(pad && board)
		{
			if( w > h )	// landscape
			{
				board.classList.add('horizontal');
				pad.classList.add('horizontal');
				
				//var bw = board.clientWidth;
				//pad.style.left = (w-bw) + 'px';
			}
			else
			{
				board.classList.remove('horizontal');
				pad.classList.remove('horizontal');

				//var ph = pad.clientHeight;
				//board.style.bottom = h + 'px';
			}
		}
	};

	this.listenResize = function()
	{
		document.onresize = this.resize;
		document.body.onresize = this.resize;

		document.addEventListener('orientationchange', this.resize);
	};
	this.init = function()
	{
		this.setup();
		this.displayInput();
		this.resize();
		this.listenResize();
	};
};

