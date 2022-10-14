local	nuiOpen = false

RegisterNUICallback("imgui::close", function()
	SetNuiFocus(false, false)
	nuiOpen = false
end)


function draw(x, y, z, text)
    local visible, x1, y1 = GetScreenCoordFromWorldCoord(x, y, z);

    if (visible) then
        SetTextScale(0.5, 0.5)
        SetTextFont(0)
        SetTextProportional(true)
        SetTextColour(255, 255, 255, 255)
        SetTextDropshadow(0, 0, 0, 0, 255)
        SetTextEdge(2, 0, 0, 0, 150)
        SetTextDropShadow()
        SetTextOutline()
        SetTextEntry("STRING")
        SetTextCentre(true)
        AddTextComponentString(text)
        DrawText(x1, y1)
	end
end

oldObject = nil

RegisterNUICallback("setrot", function(data)
	if oldObject ~= nil then
		SetEntityRotation(oldObject, data.x, data.y, data.z)
	end
end)

RegisterNUICallback("setpos", function(pos)
	if oldObject ~= nil then
		SetEntityCoords(oldObject, pos.x, pos.y, pos.z)
	end
end)

RegisterNUICallback("delete", function(pos)
	if oldObject ~= nil then
		DeleteEntity(oldObject)
		oldObject = nil
	end
end)


RegisterNUICallback("click", function(data, cb)

	-- print(data.x, data.y)
	
	local hitSomething, worldPos, normalDir, hitEntity = ScreenToWorld(data, 1000.0)
	if (not DoesEntityExist(hitEntity) or not IsEntityAnObject(hitEntity)) then
        return
    end
	
	-- if (hitSomething) then
	-- 	SetEntityCoords(PlayerPedId(), worldPos)
	-- end

	local object = hitEntity

	
	if (DoesEntityExist(object)) then
		SetEntityAsMissionEntity(object)
		-- DeleteEntity(object)
		SetEntityDrawOutlineShader(1)
		SetEntityDrawOutline(object, true)
		if (oldObject ~= nil) then
			SetEntityDrawOutline(oldObject, false)
		end
		oldObject = object
		local pos = GetEntityCoords(object)
		local rot = GetEntityRotation(object)
		local matrix = GetEntityMatrix(object)
		cb({pos = {pos.x, pos.y, pos.z}, rot = {rot.x, rot.y, rot.z}, matrix = {matrix.x, matrix.y, matrix.z}, model = GetEntityModel(object)})
	end

end)

CreateThread(function()
	local open = false
	while (true) do
		Wait(0)
		if (IsControlJustReleased(0, 19)) then -- left alt
			open = not open
			-- SetMouseCursorActiveThisFrame()
			-- DisableControlAction(0, 24, true) -- left click
			-- DisableControlAction(0, 25, true) -- right click
			-- DisableControlAction(0, 1, true) -- mouse moving left right
			-- DisableControlAction(0, 2, true) -- mouse moving up down
			-- if (IsDisabledControlJustPressed(0, 25)) then -- right mouse
			-- 	local screenPosition = GetCursorScreenPosition()
				
			-- end
			SetNuiFocus(open, open)
		end
	end
end)
	
RegisterCommand("imgui", function()
    nuiOpen = not nuiOpen
	-- SetNuiFocus(nuiOpen, nuiOpen)
	SendNUIMessage({type = "open", payload = nuiOpen})
	thread = CreateThread(function()
		while nuiOpen do
			-- SetMouseCursorActiveThisFrame()

			DisableControlAction(0, 1, nuiOpen) -- LookLeftRight
			DisableControlAction(0, 2, nuiOpen) -- LookUpDown
			DisableControlAction(0, 16, nuiOpen) -- ScrollUp
			DisableControlAction(0, 17, nuiOpen) -- ScrollDown

			DisableControlAction(0, 142, nuiOpen) -- MeleeAttackAlternate
			DisableControlAction(0, 106, nuiOpen) -- VehicleMouseControlOverride

			if IsDisabledControlJustReleased(0, 142) then -- MeleeAttackAlternate
				SendNUIMessage({
					type = "click"
				})
			end
			if IsDisabledControlJustReleased(0, 16) then -- ScrollUp
				SendNUIMessage({
					type = "scrollUp"
				})
			end
			if IsDisabledControlJustReleased(0, 17) then -- ScrollDown
				SendNUIMessage({
					type = "scrollDown"
				})
			end
			Wait(0)
		end
		SetNuiFocus(false, false)
	end)
end)
