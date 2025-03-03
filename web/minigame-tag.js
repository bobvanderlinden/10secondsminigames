define(['utils','ludum-constants','physics','vector'],function(utils,constants,physics,Vector) {
	function initializeMinigame(gamestate) {
		var f = gamestate.frame;
		var players = gamestate.players;
		var tagclientid = gamestate.players.reduce(function(highest,player) {
			return (!highest || player.score < highest.score) ? player : highest;
		}).clientid;
		return {
			type: 'tag',
			tagclientid: tagclientid,
			players: players.map(function(player) {
				return {
					clientid: player.clientid,
					status: tagclientid !== player.clientid
				};
			})
		};
	}

	function updateMinigame(gamestate,minigame,boxcollisions,playercollisions) {
		return {
			type: minigame.type,
			tagclientid: minigame.tagclientid,
			players: minigame.players.map(function(player) {
				return {
					clientid: player.clientid,
					status: player.status && !(playercollisions[player.clientid] || []).some(function(clientid) {
						return clientid === minigame.tagclientid;
					})
				};
			})
		};
	}

	function getScores(minigame) {
		return minigame.players.map(function(player) {
			return {
				clientid: player.clientid,
				score: player.status === true ? 1 : 0
			};
		}).sort(function(a,b) { return a.score-b.score; });
	}

	function getTitle(minigame) {
		if (constants.playernames && constants.playernames[minigame.tagclientid] !== undefined) {
			return 'Tag! ' + constants.playernames[minigame.tagclientid] + ' is it!';
		} else {
			return 'Give a hug (I guess this is a bug?)';
		}
	}

	function createBox(name,x,y) {
		var r = 20;
		return {
			name: name,
			x: x-r,
			y: y-r,
			w: r*2,
			h: r*2,
			collision: physics.createBox([
				new Vector(x-r,y-r),
				new Vector(x+r,y-r),
				new Vector(x+r,y+r),
				new Vector(x-r,y+r)
			]).map(function(line) {
				line.box = name;
				return line;
			})
		};
	}

	function createBoxOnRow(name,row,column,columns) {
		var lowest = 600-80;
		var rowheight = 80+20;
		var middle = 400;
		var columnwidth = 800 / (columns+1);
		return createBox(name,(column+1)*columnwidth,lowest-rowheight*row);
	}

	function createBoxRows(rows) {
		var name = 0;
		return rows.reduce(function(boxes,columns,row) {
			return boxes.concat(
				utils.repeat(function(column) {
					return createBoxOnRow(name++,row,column,columns);
				},columns)
			);
		}, []);
	}

	function createBoxes() {
		return createBoxRows([
			2, 3, 2, 3, 6
		]);
	}

	function getCollisionLines(boxes) {
		return boxes.reduce(function(lines,box) {
			return lines.concat(box.collision);
		},[]);
	}

	function drawMinigame(minigame) {
		boxes.forEach(function(box) {
			this.drawBox.call(this, box, 'black');
		}.bind(this));
	}

	var boxes = createBoxes();
	var collisionlines = getCollisionLines(boxes);

	return {
		initialize: initializeMinigame,
		update: updateMinigame,
		getScores: getScores,
		getTitle: getTitle,
		draw: drawMinigame,

		boxes: boxes,
		collisionlines: collisionlines
	};
});