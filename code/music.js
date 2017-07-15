var midifiles = {
	"background" : "midi/background.mid"
};

Mario.PlayMusic = function(name) {
	if(name in midifiles)
	{
		MIDIjs.stop();
		MIDIjs.play(midifiles[name]);
	}else{
		console.error("Cannot play music track " + name + " as i have no data for it.");
	}
};

Mario.PlayOvergroundMusic = function() {
	Mario.PlayMusic("background");
};

Mario.StopMusic = function() {
	MIDIjs.stop();
};
