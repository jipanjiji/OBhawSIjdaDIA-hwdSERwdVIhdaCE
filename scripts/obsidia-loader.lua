--[[
    ╔═══════════════════════════════════════════════╗
    ║          OBSIDIA SERVICE — Key Loader         ║
    ║                                               ║
    ║  Premium Key Validation Script                ║
    ║  This script validates the user's key against ║
    ║  the Obsidia Hub backend server.              ║
    ║                                               ║
    ║  Response format:                             ║
    ║  {                                            ║
    ║    success: boolean,                          ║
    ║    message: string,                           ║
    ║    status: "valid" | "invalid_key" |           ║
    ║            "expired" | "revoked" |             ║
    ║            "hwid_mismatch"                     ║
    ║  }                                            ║
    ╚═══════════════════════════════════════════════╝
]]

-- ============================================
-- CONFIGURATION — Change this to your Vercel domain
-- ============================================
local API_URL = "https://your-obsidia-hub.vercel.app/api/client/validate"

-- ============================================
-- HWID RETRIEVAL
-- Attempts multiple methods to get a unique identifier.
-- Supports: Fluxus, Delta, Synapse, Wave, and fallback.
-- ============================================
local function getHWID()
    local hwid = nil

    -- Method 1: Try executor-specific HWID functions
    local success, result = pcall(function()
        -- Most executors provide a gethwid() or get_hwid() global
        if gethwid then return gethwid() end
        if get_hwid then return get_hwid() end

        -- Fluxus / Delta fingerprint via request headers
        if getexecutorname then
            local execName = getexecutorname()
            -- Some executors auto-inject HWID headers; 
            -- we can also use identifyexecutor()
        end

        return nil
    end)

    if success and result then
        hwid = tostring(result)
    end

    -- Method 2: Try RbxAnalyticsService (fallback unique ID)
    if not hwid or hwid == "" then
        local ok, id = pcall(function()
            return game:GetService("RbxAnalyticsService"):GetClientId()
        end)
        if ok and id then
            hwid = tostring(id)
        end
    end

    -- Method 3: Use HttpService GUID as last resort (changes per session)
    if not hwid or hwid == "" then
        local ok, guid = pcall(function()
            return game:GetService("HttpService"):GenerateGUID(false)
        end)
        if ok and guid then
            hwid = guid
        end
    end

    return hwid or "UNKNOWN-HWID"
end

-- ============================================
-- HTTP REQUEST
-- Uses the executor's request/http_request function.
-- ============================================
local function httpPost(url, body)
    local httpRequest = (syn and syn.request) 
        or (http and http.request) 
        or http_request 
        or request 
        or (fluxus and fluxus.request)

    if not httpRequest then
        return nil, "No HTTP function available. Your executor may not support HTTP requests."
    end

    local success, response = pcall(function()
        return httpRequest({
            Url = url,
            Method = "POST",
            Headers = {
                ["Content-Type"] = "application/json",
            },
            Body = game:GetService("HttpService"):JSONEncode(body),
        })
    end)

    if not success then
        return nil, "HTTP request failed: " .. tostring(response)
    end

    if response and response.Body then
        local decodeOk, decoded = pcall(function()
            return game:GetService("HttpService"):JSONDecode(response.Body)
        end)
        if decodeOk then
            return decoded, nil
        else
            return nil, "Failed to decode response"
        end
    end

    return nil, "Empty response from server"
end

-- ============================================
-- MAIN VALIDATION FUNCTION
-- Call this with the user's key.
-- Returns: { success: bool, message: string, status: string }
-- ============================================
local function validateKey(key)
    if not key or key == "" then
        return {
            success = false,
            message = "No key provided.",
            status = "invalid_key"
        }
    end

    -- Get HWID
    local hwid = getHWID()
    print("[Obsidia] HWID: " .. hwid)
    print("[Obsidia] Validating key...")

    -- Send validation request
    local response, err = httpPost(API_URL, {
        key = key,
        hwid = hwid,
    })

    if err then
        return {
            success = false,
            message = err,
            status = "error"
        }
    end

    return response
end

-- ============================================
-- USAGE EXAMPLE
-- Replace "YOUR-KEY-HERE" with the actual key,
-- or implement your own UI to collect it.
-- ============================================

-- Example: Prompt user for key input
local key = "YOUR-KEY-HERE"  -- Replace with your key input logic

local result = validateKey(key)

if result.success then
    print("[Obsidia] ✅ " .. result.message)
    print("[Obsidia] Key validated! Loading premium features...")
    
    -- ========================================
    -- YOUR LOGIC HERE
    -- Add your premium script logic below.
    -- Example: loadstring(game:HttpGet("https://..."))()
    -- ========================================
    
else
    warn("[Obsidia] ❌ " .. result.message)
    warn("[Obsidia] Status: " .. (result.status or "unknown"))
    
    -- Handle specific error cases in your script:
    -- result.status == "invalid_key"    → Key doesn't exist
    -- result.status == "expired"        → Key has expired
    -- result.status == "revoked"        → Key was revoked by admin
    -- result.status == "hwid_mismatch"  → Key is bound to another device
    -- result.status == "error"          → Network/HTTP error
end

--[[
    ============================================
    RESPONSE STATUS REFERENCE
    ============================================
    
    Status          | Success | Description
    --------------- | ------- | ------------------------------------
    valid           | true    | Key is valid, access granted
    invalid_key     | false   | Key does not exist in database
    expired         | false   | Key has passed its expiration date
    revoked         | false   | Key was manually revoked by admin
    hwid_mismatch   | false   | Key is bound to a different device
    error           | false   | Network or server error
    
    ============================================
]]
