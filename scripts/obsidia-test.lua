local API_URL = "https://obsidia-service.vercel.app/api/client/validate"
local KEY = "YOUR_KEY" 

-- Get HWID
local function getHWID()
    local ok, result = pcall(function()
        if gethwid then return gethwid() end
        if get_hwid then return get_hwid() end
        return nil
    end)
    if ok and result then return tostring(result) end

    local ok2, id = pcall(function()
        return game:GetService("RbxAnalyticsService"):GetClientId()
    end)
    if ok2 and id then return tostring(id) end

    return "TEST-HWID-" .. tostring(game.Players.LocalPlayer.UserId)
end

local httpRequest = (syn and syn.request) or http_request or request or (http and http.request) or (fluxus and fluxus.request)

if not httpRequest then
    warn("[Obsidia] Executor tidak support HTTP request!")
    return
end

local hwid = getHWID()
print("[Obsidia] HWID: " .. hwid)
print("[Obsidia] Validating key...")

local ok, response = pcall(function()
    return httpRequest({
        Url = API_URL,
        Method = "POST",
        Headers = { ["Content-Type"] = "application/json" },
        Body = game:GetService("HttpService"):JSONEncode({
            key = KEY,
            hwid = hwid
        })
    })
end)

if not ok then
    warn("[Obsidia] Request gagal: " .. tostring(response))
    return
end

local data = game:GetService("HttpService"):JSONDecode(response.Body)

print("============================")
print("[Obsidia] Success: " .. tostring(data.success))
print("[Obsidia] Message: " .. tostring(data.message))
print("[Obsidia] Status:  " .. tostring(data.status))
print("============================")

if data.success then
    print("[Obsidia] KEY VALID!")
else
    warn("[Obsidia] KEY INVALID!")
end
