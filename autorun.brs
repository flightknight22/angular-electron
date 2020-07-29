Sub Main()
rs = createobject("roregistrysection", "html")
mp = rs.read("mp")
if mp <> "1" then
    rs.write("mp","1")
    rs.flush()
    RebootSystem()
endif
msgPort = CreateObject("roMessagePort")
r = CreateObject("roRectangle", 0, 0, 1920, 1080)
is = {
  port: 3000
}
config = {
    nodejs_enabled: true
    inspector_server: is
    brightsign_js_objects_enabled: true
    url: "file:///sd:/bs-start.html"
    security_params: {websecurity: false }
    storage_path: "SD:"
    transform: "identity"
    mouse_enabled: true
    storage_quota: 1073741824
}
reg = CreateObject("roRegistrySection", "networking")
reg.write("ssh","22")

n=CreateObject("roNetworkConfiguration", 0)
t=CreateObject("roTouchScreen")
t.setPort(msgPort)
t.EnableCursor(TRUE)



n.SetLoginPassword("password")
n.Apply()
reg.flush()
h = CreateObject("roHtmlWidget", r, config)
h.EnableCanvas2dAcceleration(true)
h.SetPort(msgPort)

h.Show()
while true
    msg = wait(0, msgPort)
    print "type(msg)=";type(msg)
    if type(msg) = "roHtmlWidgetEvent" then
        eventData = msg.GetData()
        if type(eventData) = "roAssociativeArray" and type(eventData.reason) = "roString" then
            print "reason = ";eventData.reason
            if eventData.reason = "load-error" then
                print "message = ";eventData.message
            endif
        endif
    endif
end while
End Sub
