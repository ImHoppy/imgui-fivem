// import { ImGui, ImGui_Impl } from '@zhobo63/imgui-ts';

var time = Date.now();
window.post = function(url, data) {
	if (time + 10 < Date.now())
	{
		time = Date.now();
		return fetch(`https://${GetParentResourceName()}/${url}`, {method: "POST", headers: {'Content-Type': 'application/json'}, body: JSON.stringify(data)});
	}
	return Promise.reject('wait before post');
}

var Obj = {
	exist: false,
	model: "",
	pos: [0,0,0],
	rot: [0,0,0],
	scale: [0,0,0],
}

document.oncontextmenu = (e) => {
	// console.log(e);
	// {x: e.x, y: e.y}
	post("click", {x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight}).then(resp => resp.json()).then(resp => {
		console.log(resp);
		Obj.pos = resp.pos;
		Obj.rot = resp.rot;
		Obj.scale = resp.matrix;
		Obj.model = resp.model.toString();
		Obj.exist = true; 
	}).catch(()=>{});
};

function menuTest() {
	/* static */ let buf = "Quick brown fox";
	/* static */ let f = 0.6;

	ImGui.SetNextWindowPos(new ImGui.ImVec2(20, 20), ImGui.Cond.FirstUseEver);
	ImGui.SetNextWindowSize(new ImGui.ImVec2(294, 140), ImGui.Cond.FirstUseEver);
	ImGui.Begin("test", null, ImGui.ImGuiWindowFlags.MenuBar );

	try {
		if(ImGui.BeginMenuBar()) {
			if (ImGui.BeginMenu("Menu"))
				{
					if (ImGui.MenuItem("Some menu item")) {}
					ImGui.EndMenu();
				}
			ImGui.EndMenuBar();
		}
		ImGui.Text(`Hello, world ${123}`);
		if (ImGui.Button("Save"))
		{
			console.log("Save");
		}
		ImGui.InputText("string", (_ = buf) => buf = _, 256);
		ImGui.SliderFloat("float", (_ = f) => f = _, 0.0, 1.0);
		ImGui.ColorEdit4("clear color", clear_color);

	} catch (e) {
		ImGui.TextColored(new ImGui.ImVec4(1.0,0.0,0.0,1.0), "error: ");
		ImGui.SameLine();
		ImGui.Text(e.message);
	}
	
	ImGui.End();
}

var i = 0;
function menuObject() {
	ImGui.SetNextWindowPos(new ImGui.ImVec2(20, 20), ImGui.Cond.FirstUseEver);
	ImGui.SetNextWindowSize(new ImGui.ImVec2(294, 140), ImGui.Cond.FirstUseEver);
	ImGui.Begin("Objects Editor");

	let buf = Obj.model
	try {
		i += 0.001
		ImGui.ProgressBar(i%1);
		ImGui.Text(`Hello, world`);
		// ImGui.SliderFloat("float", (_ = f) => f = _, 0.0, 1.0);
		// ImGui.ColorEdit4("clear color", clear_color);
		if (!Obj.exist)
		throw {message: "No object selected"};
		ImGui.InputText("Model", (_ = buf) => buf = _, 256);
		if (ImGui.DragFloat3("Pos", Obj.pos, 0.1))
			post("setpos", {x: Obj.pos[0], y: Obj.pos[1], z: Obj.pos[2]}).catch(()=>{});
		if (ImGui.DragFloat3("Rotation", Obj.rot, 0.5, -179.0, 179, "%.1f\°"))
			post("setrot", {x: Obj.rot[0], y: Obj.rot[1], z: Obj.rot[2]}).catch(()=>{});
		if (ImGui.Button("Delete"))
		{
			post("delete", {}).catch(()=>{});
			Obj.exist = false;
		}
	} catch (e) {
		ImGui.TextColored(new ImGui.ImVec4(1.0,0.0,0.0,1.0), "error: ");
		ImGui.SameLine();
		ImGui.Text(e?.message);
	}
	
	ImGui.End();
}

window.addEventListener('message', (event) => {
	if (event.data.type === 'open') {
		hasObject = true;
		Pos = event.data.pos;
		Rot = event.data.rot;
	}
});

(async function() {
	await ImGui.default();

	const canvas = document.getElementById("output");
	const devicePixelRatio = window.devicePixelRatio || 1;
	canvas.width = canvas.scrollWidth * devicePixelRatio;
	canvas.height = canvas.scrollHeight * devicePixelRatio;
	window.addEventListener("resize", () => {
		const devicePixelRatio = window.devicePixelRatio || 1;
		canvas.width = canvas.scrollWidth * devicePixelRatio;
		canvas.height = canvas.scrollHeight * devicePixelRatio;
	});

	ImGui.CreateContext();
	ImGui_Impl.Init(canvas);

	// ImGui.StyleColorsDark();
	ImGui.StyleColorsLight();
	// ImGui.StyleColorsClassic();
	// ImGui.GetStyle().Alpha = 1;
	
	const clear_color = new ImGui.ImVec4(0.45, 0.55, 0.60, 0.00);

	let done = false;
	window.requestAnimationFrame(_loop);
	function _loop(time) {
		ImGui_Impl.NewFrame(time);
		ImGui.NewFrame();
	
		menuObject()
		menuTest()

		ImGui.EndFrame();

		ImGui.Render();
		const gl = ImGui_Impl.gl;
		gl && gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
		// gl && gl.clearColor(clear_color.x, clear_color.y, clear_color.z, clear_color.w);
		gl.clearColor(1, 1, 1, 0);
		gl.colorMask(false, false, false, true);
		gl.clear(gl.COLOR_BUFFER_BIT);
		gl.colorMask(true, true, true, true);

		// gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
		// gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
		// gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
		// gl.useProgram(0); // You may want this if using this code in an OpenGL 3+ context where shaders may be bound

		ImGui_Impl.RenderDrawData(ImGui.GetDrawData());

		window.requestAnimationFrame(done ? _done : _loop);
	}

	function _done() {
		ImGui_Impl.Shutdown();
		ImGui.DestroyContext();
	}
})();