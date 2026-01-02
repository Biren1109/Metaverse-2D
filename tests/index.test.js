const { default: axios } = require("axios");
const test = require("node:test");
const { type } = require("os");
const { resolve } = require("path");

const BACKEND_URL = "https://localhost:3000";
const WS_URL = "ws://localhost:3001";

// Tests for HTTP Server
describe("Authentication", () => {
    test('User is able to sign up only once', async () => {
        const username = "biren" + Math.random();
        const password = "123456";
        const response = axios.post(`${BACKEND_URL}/api/v1/signup`, {
            username,
            password,
            type: "admin"
        })
        expect(response.statusCode).toBe(200)

        const updatedResponse = axios.post(`${BACKEND_URL}/api/v1/signup`, {
            username,
            password,
            type: "admin"
        })
        expect(updatedResponse.statusCode).toBe(400);
    });

    test('User sign up request fails if username is empty', async () => {
        const username = `biren-${Math.random()}`
        const password = "123456"

        const response = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
            password
        })
        expect(response.statusCode).toBe(400);
    });

    test('Sign in succeeds if the usernamee and password are correct', async () => {
        const username = `biren-${Math.random()}`
        const password = "123456"

        axios.post(`${BACKEND_URL}/api/v1/signup`, {
            username,
            password
        });

        const response = axios.post(`${BACKEND_URL}/api/v1/signin`, {
            username,
            password
        });
        expect(response.statusCode).toBe(200)
        expect(response.body.token).toBeDefined()
    });

    test('Signin fails if the username and password are incorrect', async () => {
        const username = "WrongUsername"
        const password = "123456"

        axios.post(`${BACKEND_URL}/api/v1/signup`, {
            username,
            password
        });

        const response = axios.post(`${BACKEND_URL}/api/v1/signin`, {
            username,
            password
        });
        expect(response.statusCode).toBe(200)
        expect(response.body.token).toBeDefined()

    })
})

describe("User Metadata Endpoints", () => {
    let token = "";
    let avatarId = ""

    beforeAll(async () => {
        const username = `biren-${Math.random()}`
        const password = "123456"

        await axios.post(`${BACKEND_URL}/api/v1/signup`, {
            username,
            password,
            type: "admin"
        })

        const response = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
            username,
            password
        })
        token = response.data.token;

        const avtarResponse = await axios.post(`${BACKEND_URL}/api/avtar/v1/admin/avtar`, {
            "imageUrl": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQm3RFDZM21teuCMFYx_AROjt-AzUwDBROFww&s",
            "name": "Timmy"
        })

        avatarId = avtarResponse.data.avatarId;
    })

    test("User cant update their metadata with a wrong avatar id", async () => {
        const response = await axios.post(`${BACKEND_URL}/api/v1/user/metadata`, {
            avatarId: "123123"
        }, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        })
        expect(response.statusCode).toBE(400)
    })

    test("User cant update their metadata with right avtar id", async () => {
        const response = await axios.post(`${BACKEND_URL}/api/v1/user/metadata`, {
            avatarId
        }, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        })
        expect(response.statusCode).toBE(200)
    })

    test("User is not able to upddate their metadata if the auth header is not present", async () => {
        const response = await axios.post(`${BACKEND_URL}/api/v1/user.metadata`, {
            avatarId
        })
        expect(response.statusCode).toBe(403)
    })
})

describe("User avatar information", () => {
    let token;
    let avatarId;
    let userID;

    beforeAll(async () => {
        const username = `biren-${Math.random()}`
        const password = "123456"

        const signupResponse = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
            username,
            password,
            type: "admin"
        })

        userID = signupResponse.data.userID;

        const response = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
            username,
            password
        })
        token = response.data.token;

        const avtarResponse = await axios.post(`${BACKEND_URL}/api/avtar/v1/admin/avtar`, {
            "imageUrl": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQm3RFDZM21teuCMFYx_AROjt-AzUwDBROFww&s",
            "name": "Timmy"
        }, {
            headers: {
                "Authorization": `Bearer ${adminTokenoken}`
            }
        })

        avatarId = avtarResponse.data.avatarId;
    })

    test("Get back avatar information for a user", async () => {
        const response = await axios.get(`${BACKEND_URL}/api/v1/user/metadata/bulk?ids=[${userID}]`);

        expect(response.data.avatars.length).toBe(1);
        expect(response.data.avatars[0].userID).toBe(userID)
    })

    test("Available avatars lists the recently created avatars", async () => {
        const response = axios.get(`${BACKEND_URL}/api/v1/avatars`);
        expect(response.data.avatars.length).not.toBe(0);

        const currentAvatar = response.data.avatars.find(x => x.id == avatarId);
        expect(currentAvatar).toBeDefined()

    })
})

describe("Space information", () => {
    let mapId;
    let element1Id;
    let element2Id;
    let adminToken;
    let adminId;
    let userToken;
    let userID;

    beforeAll(async () => {
        const username = `biren-${Math.random()}`
        const password = "123456"

        const signupResponse = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
            username,
            password,
            type: "admin"
        })

        adminId = signupResponse.data.userID;

        const response = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
            username,
            password
        })
        adminToken = response.data.token;

        const userSignupResponse = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
            username: username + "-user",
            password,
            type: "user"
        })

        userID = userSignupResponse.data.userID;

        const userSigninResponse = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
            username: username + "-user",
            password
        })
        userToken = userSigninResponse.data.token;

        const element1Response = await axios.post(`${BACKEND_URL}/api/v1/admin/element`, {
            "imageUrl": "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
            "width": 1,
            "height": 1,
            "static": true // weather or not the user can sit on top of this element (is it considered as a collission or not)
        }, {
            headers: {
                Authorization: `Bearer ${adminToken}`
            }
        })
        const element2Response = await axios.post(`${BACKEND_URL}/api/v1/admin/element`, {
            "imageUrl": "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
            "width": 1,
            "height": 1,
            "static": true // weather or not the user can sit on top of this element (is it considered as a collission or not)
        }, {
            headers: {
                Authorization: `Bearer ${adminToken}`
            }
        });
        element1Id = element1Response.data.id
        element2Id = element2Response.data.id

        const mapResponse = await axios.post(`${BACKEND_URL}/api/v1/admin/map`, {
            "thumbnail": "https://thumbnail.com/a.png",
            "dimensions": "100x200",
            "name": "100 person interview room",
            "defaultElements": [{
                elementId: element1Id,
                x: 20,
                y: 20
            }, {
                elementId: element1Id,
                x: 18,
                y: 20
            }, {
                elementId: element2Id,
                x: 19,
                y: 20
            }, {
                elementId: element2Id,
                x: 19,
                y: 20
            }
            ]
        }, {
            headers: {
                Authorization: `Bearer ${adminToken}`
            }
        })

        mapId = mapResponse.data.id;
    });

    test("User is able to create a space", async () => {
        const response = await axios.post(`${BACKEND_URL}/api/v1/space`, {
            "name": "Test",
            "dimensions": "100x200",
            "mapId": mapId
        }, {
            headers: {
                Authorization: `Bearer ${userToken}`
            }
        })
        expect(response.data.spaceId).toBeDefined()
    })

    test("User is not able to create a space witohut Map Id and Dimensions", async () => {
        const response = await axios.post(`${BACKEND_URL}/api/v1/space`, {
            "name": "Test"
        }, {
            headers: {
                Authorization: `Bearer ${userToken}`
            }
        })
        expect(response.statusCode).toBe(400)
    })

    test("User is not able to create a space witohut Map Id and Dimensions", async () => {
        const response = await axios.post(`${BACKEND_URL}/api/v1/space`, {
            "name": "Test"
        }, {
            headers: {
                Authorization: `Bearer ${userToken}`
            }
        })
        expect(response.statusCode).toBe(400)
    })

    test("User is not able to delete a space that doesn`t Exist", async () => {
        const response = await axios.delete(`${BACKEND_URL}/api/v1/space/randomSpaceId`, {
            headers: {
                Authorization: `Bearer ${userToken}`
            }
        })
        expect(response.statusCode).toBe(400)
    })

    test("User is able to delete a space that does Exist", async () => {
        const response = await axios.post(`${BACKEND_URL}/api/v1/space`, {
            "name": "Test",
            "dimensions": "100x200",
            "mapId": mapId
        }, {
            headers: {
                Authorization: `Bearer ${userToken}`
            }
        })
        const deleteResponse = await axios.delete(`${BACKEND_URL}/api/v1/space/${response.data.spaceId}`, {
            headers: {
                Authorization: `Bearer ${userToken}`
            }
        })
        expect(deleteResponse.statusCode).toBe(200)
    })

    test("User should not be able to delete a space created by another user", async () => {
        const response = await axios.post(`${BACKEND_URL}/api/v1/space`, {
            "name": "Test",
            "dimensions": "100x200",
            "mapId": mapId
        }, {
            headers: {
                Authorization: `Bearer ${userToken}`
            }
        })
        const deleteResponse = await axios.delete(`${BACKEND_URL}/api/v1/space/${response.data.spaceId}`, {
            headers: {
                Authorization: `Bearer ${adminToken}`
            }
        })
        expect(deleteResponse.statusCode).toBe(400)
    })

    test("Admin has no spaces initially", async () => {
        const response = await axios.get(`${BACKEND_URL}/api/v1/space/all`, {
            headers: {
                Authorization: `Bearer ${userToken}`
            }
        })
        expect(response.data.spaces.length).toBe(0)
    })

    test("Admin has no space initially", async () => {
        const spaceCreateResponse = await axios.post(`${BACKEND_URL}/api/v1/space/all`, {
            "name": "Test",
            "dimension": "100x200"
        }, {
            headers: {
                Authorization: `Bearer ${userToken}`
            }
        });
        const response = await axios.get(`${BACKEND_URL}/api/v1/space/all`);
        const filteredSpace = response.data.spaces.find(x => x.id == spaceCreateResponse.spaceId)
        expect(response.data.spaces.length).toBe(0)
        expect(filteredSpace).toBeDefined()

    })
})

describe("Arena Endpoints", () => {
    let mapId;
    let element1Id;
    let element2Id;
    let adminToken;
    let adminId;
    let userToken;
    let userID;
    let spaceId;

    beforeAll(async () => {
        const username = `biren-${Math.random()}`
        const password = "123456"

        const signupResponse = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
            username,
            password,
            type: "admin"
        })

        adminId = signupResponse.data.userID;

        const response = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
            username,
            password
        })
        adminToken = response.data.token;

        const userSignupResponse = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
            username: username + "-user",
            password,
            type: "user"
        })

        userID = userSignupResponse.data.userID;

        const userSigninResponse = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
            username: username + "-user",
            password
        })
        userToken = userSigninResponse.data.token;

        const element1Response = await axios.post(`${BACKEND_URL}/api/v1/admin/element`, {
            "imageUrl": "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
            "width": 1,
            "height": 1,
            "static": true // weather or not the user can sit on top of this element (is it considered as a collission or not)
        }, {
            headers: {
                Authorization: `Bearer ${adminToken}`
            }
        })
        const element2Response = await axios.post(`${BACKEND_URL}/api/v1/admin/element`, {
            "imageUrl": "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
            "width": 1,
            "height": 1,
            "static": true // weather or not the user can sit on top of this element (is it considered as a collission or not)
        }, {
            headers: {
                Authorization: `Bearer ${adminToken}`
            }
        });
        element1Id = element1Response.data.id
        element2Id = element2Response.data.id

        const mapResponse = await axios.post(`${BACKEND_URL}/api/v1/admin/map`, {
            "thumbnail": "https://thumbnail.com/a.png",
            "dimensions": "100x200",
            "name": "100 person interview room",
            "defaultElements": [{
                elementId: element1Id,
                x: 20,
                y: 20
            }, {
                elementId: element1Id,
                x: 18,
                y: 20
            }, {
                elementId: element2Id,
                x: 19,
                y: 20
            }, {
                elementId: element2Id,
                x: 19,
                y: 20
            }
            ]
        }, {
            headers: {
                Authorization: `Bearer ${adminToken}`
            }
        })
        mapId = mapResponse.data.id;

        const spaceResponse = await axios.post(`${BACKEND_URL}/api/v1/space`, {
            "name": "Test",
            "dimensions": "100x200",
            "mapId": "map1"
        }, {
            headers: {
                Authorization: `Bearer ${userToken}`
            }
        })
        spaceId = spaceResponse.data.spaceId
    });

    test("Incorrect SpaceId returns 400", async () => {
        const response = await axios.get(`${BACKEND_URL}/api/v1/space/123xyz`, {
            headers: {
                Authorization: `Bearer ${userToken}`
            }
        });
        expect(response.statusCode).toBe(400)
    })

    test("Correct SpaceId returns all Elements", async () => {
        const response = await axios.get(`${BACKEND_URL}/api/v1/space/${spaceId}`, {
            headers: {
                Authorization: `Bearer ${userToken}`
            }
        });
        expect(response.data.dimensions).toBe("100x200")
        expect(response.data.elements.length).toBe(3)
    })

    test("Delete endpoint is able to delete an elements", async () => {
        const response = await axios.get(`${BACKEND_URL}/api/v1/space/${spaceId}`, {
            headers: {
                Authorization: `Bearer ${userToken}`
            }
        });

        await axios.delete(`${BACKEND_URL}/api/v1/space/element`, {
            spaceId: spaceId,
            elementId: response.data.elements[0].id
        }, {
            headers: {
                Authorization: `Bearer ${userToken}`
            }
        });
        const newResponse = await axios.get(`${BACKEND_URL}/api/v1/space/${spaceId}`, {
            headers: {
                Authorization: `Bearer ${userToken}`
            }
        });
        expect(newResponse.data.elements.length).toBe(2)
    })

    test("Adding element fails if element lies outside dimensions", async () => {

        await axios.post(`${BACKEND_URL}/api/v1/space/element`, {
            "elementId": element1Id,
            "spaceId": spaceId,
            "x": 3500,
            "y": 2800
        }, {
            headers: {
                Authorization: `Bearer ${userToken}`
            }
        });
        expect(newResponse.statusCode).toBe(400)
    })

    test("Adding element works as Expected", async () => {

        await axios.post(`${BACKEND_URL}/api/v1/space/element`, {
            "elementId": element1Id,
            "spaceId": spaceId,
            "x": 50,
            "y": 20
        }, {
            headers: {
                Authorization: `Bearer ${userToken}`
            }
        });
        const newResponse = await axios.get(`${BACKEND_URL}/api/v1/space/${spaceId}`, {
            headers: {
                Authorization: `Bearer ${userToken}`
            }
        });
        expect(newResponse.data.elements.length).toBe(3)
    })
})

describe("Admin Endpoints", () => {

    let adminToken;
    let adminId;
    let userToken;
    let userID;

    beforeAll(async () => {
        const username = `biren-${Math.random()}`
        const password = "123456"

        const signupResponse = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
            username,
            password,
            type: "admin"
        })

        adminId = signupResponse.data.userID;

        const response = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
            username,
            password
        })
        adminToken = response.data.token;

        const userSignupResponse = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
            username: username + "-user",
            password,
            type: "user"
        })

        userID = userSignupResponse.data.userID;

        const userSigninResponse = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
            username: username + "-user",
            password
        })
        userToken = userSigninResponse.data.token;

    });

    test("User is not able to hit admin Endpoints", async () => {

        const elementResponse = await axios.post(`${BACKEND_URL}/api/v1/admin/element`, {
            "imageUrl": "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
            "width": 1,
            "height": 1,
            "static": true // weather or not the user can sit on top of this element (is it considered as a collission or not)
        }, {
            headers: {
                Authorization: `Bearer ${userToken}`
            }
        });

        const mapResponse = await axios.post(`${BACKEND_URL}/api/v1/admin/map`, {
            "thumbnail": "https://thumbnail.com/a.png",
            "dimensions": "100x200",
            "name": "100 person interview room",
            "defaultElements": []
        }, {
            headers: {
                Authorization: `Bearer ${userToken}`
            }
        })
        const avatarResponse = await axios.post(`${BACKEND_URL}/api/avtar/v1/admin/avtar`, {
            "imageUrl": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQm3RFDZM21teuCMFYx_AROjt-AzUwDBROFww&s",
            "name": "Timmy"
        }, {
            headers: {
                Authorization: `Bearer ${userToken}`
            }
        })

        const updateElementResponse = await axios.put(`${BACKEND_URL}/api/avtar/v1/admin/element/123`, {
            "imageUrl": "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE"
        }, {
            headers: {
                Authorization: `Bearer ${userToken}`
            }
        })

        expect(elementResponse.statusCode).toBe(403)
        expect(mapResponse.statusCode).toBe(403)
        expect(avatarResponse.statusCode).toBe(403)
        expect(updateElementResponse.statusCode).toBe(403)
    })

    test("Admin is able to hit admin Endpoints", async () => {

        const elementResponse = await axios.post(`${BACKEND_URL}/api/v1/admin/element`, {
            "imageUrl": "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
            "width": 1,
            "height": 1,
            "static": true // weather or not the user can sit on top of this element (is it considered as a collission or not)
        }, {
            headers: {
                Authorization: `Bearer ${adminToken}`
            }
        });

        const mapResponse = await axios.post(`${BACKEND_URL}/api/v1/admin/map`, {
            "thumbnail": "https://thumbnail.com/a.png",
            "dimensions": "100x200",
            "name": "100 person interview room",
            "defaultElements": []
        }, {
            headers: {
                Authorization: `Bearer ${adminToken}`
            }
        })
        const avatarResponse = await axios.post(`${BACKEND_URL}/api/avtar/v1/admin/avtar`, {
            "imageUrl": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQm3RFDZM21teuCMFYx_AROjt-AzUwDBROFww&s",
            "name": "Timmy"
        }, {
            headers: {
                Authorization: `Bearer ${adminToken}`
            }
        })
        expect(elementResponse.statusCode).toBe(200)
        expect(mapResponse.statusCode).toBe(200)
        expect(avatarResponse.statusCode).toBe(200)
    })

    test("Admin is able to Update an Element", async () => {
        const elementResponse = await axios.post(`${BACKEND_URL}/api/v1/admin/element`, {
            "imageUrl": "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
            "width": 1,
            "height": 1,
            "static": true // weather or not the user can sit on top of this element (is it considered as a collission or not)
        }, {
            headers: {
                Authorization: `Bearer ${adminToken}`
            }
        })

        const updateElementResponse = await axios.put(`${BACKEND_URL}/api/avtar/v1/admin/element/${elementResponse.data.id}`, {
            "imageUrl": "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE"
        }, {
            headers: {
                Authorization: `Bearer ${userToken}`
            }
        })
        expect(updateElementResponse.statusCode).toBe(200);
    })
})

// Tests for Websocket
describe("Websocket Tests", () => {
    let adminToken;
    let adminId;
    let userToken;
    let userID;
    let mapId;
    let element1Id;
    let element2Id;
    let spaceId;
    let ws1;
    let ws2;
    let ws1Messages = []
    let ws2Messages = []
    let userX;
    let userY;
    let adminX;
    let adminY;

    function waitForAndPopLatestMessage(messageArray) {
        return new Promise(r => {
            if (messageArray.length > 0) {
                resolve(messageArray.shift())
            } else {
                let interval = setInterval(() => {
                    if (messageArray.length > 0) {
                        resolve(messageArray.shift())
                        clearInterval(interval)
                    }
                }, 100)
            }
        })
    }

    async function setupHTTP() {
        const username = `biren-${Math.random()}`
        const password = "123456"
        const adminSignupResponse = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
            username,
            password,
            type: "admin"
        })
        const adminSigninResponse = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
            username,
            password
        })

        adminId = adminSignupResponse.data.userID;
        adminToken = adminSigninResponse.data.token;

        const userSignupResponse = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
            username: username + `-user`,
            password
        })
        const userSigninResponse = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
            username: username + `-user`,
            password
        })

        userID = adminSignupResponse.data.userID;
        userToken = adminSigninResponse.data.token;

        const element1Response = await axios.post(`${BACKEND_URL}/api/v1/admin/element`, {
            "imageUrl": "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
            "width": 1,
            "height": 1,
            "static": true // weather or not the user can sit on top of this element (is it considered as a collission or not)
        }, {
            headers: {
                Authorization: `Bearer ${adminToken}`
            }
        })
        const element2Response = await axios.post(`${BACKEND_URL}/api/v1/admin/element`, {
            "imageUrl": "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
            "width": 1,
            "height": 1,
            "static": true // weather or not the user can sit on top of this element (is it considered as a collission or not)
        }, {
            headers: {
                Authorization: `Bearer ${adminToken}`
            }
        });
        element1Id = element1Response.data.id
        element2Id = element2Response.data.id

        const mapResponse = await axios.post(`${BACKEND_URL}/api/v1/admin/map`, {
            "thumbnail": "https://thumbnail.com/a.png",
            "dimensions": "100x200",
            "name": "100 person interview room",
            "defaultElements": [{
                elementId: element1Id,
                x: 20,
                y: 20
            }, {
                elementId: element1Id,
                x: 18,
                y: 20
            }, {
                elementId: element2Id,
                x: 19,
                y: 20
            }, {
                elementId: element2Id,
                x: 19,
                y: 20
            }
            ]
        }, {
            headers: {
                Authorization: `Bearer ${adminToken}`
            }
        })
        mapId = mapResponse.data.id;

        const spaceResponse = await axios.post(`${BACKEND_URL}/api/v1/space`, {
            "name": "Test",
            "dimensions": "100x200",
            "mapId": "map1"
        }, {
            headers: {
                Authorization: `Bearer ${userToken}`
            }
        })
        spaceId = spaceResponse.data.spaceId
    }

    async function setupWs() {
        ws1 = new WebSocket(WS_URL)
        
        await new Promise(r => {
            ws2.onopen = r
        })
        
        ws1.onmessage = (event) => {
            ws1Messages.push(JSON.parse(event.data))
        }
        
        ws2 = new WebSocket(WS_URL)

        await new Promise(r => {
            ws1.onopen = r
        })
        ws2.onmessage = (event) => {
            ws2Messages.push(JSON.parse(event.data))
        }
    }

    beforeAll(() => {
        setupHTTP()
        setupWs()

    })
    test("Get back ack for joining the Space", async () => {
        // Joins Space
        ws1.send(JSON.stringify({
            "type": "join",
            "payload": {
                "spaceId": spaceId,
                "token": adminToken
            }
        }))
        const message1 = await waitForAndPopLatestMessage(ws1Messages);

        ws2.send(JSON.stringify({
            "type": "join",
            "payload": {
                "spaceId": spaceId,
                "token": userToken
            }
        }))

        const message2 = await waitForAndPopLatestMessage(ws2Messages);
        const message3 = await waitForAndPopLatestMessage(ws1Messages);

        expect(message1.type).toBe("space-joined")
        expect(message2.type).toBe("space-joined")

        expect(message1.payload.users.length).toBe(0)
        expect(message2.payload.users.length).toBe(1)
        expect(message3.type).toBe("user-join")
        expect(message3.payload.x).toBe(message2.payload.x)
        expect(message3.payload.y).toBe(message2.payload.y)
        expect(message3.payload.userID).toBe(userID)
        
        adminX = message1.payload.spawn.x;
        adminY = message1.payload.spawn.y;

        userX = message2.payload.spawn.x;
        userY = message2.payload.spawn.y;
    })
    test("User should not be able to cross the boundry of the Wall", async () => {
        ws1.send(JSON.stringify({
            type: "movement",
            payload: {
                x: 100000,
                y: 100000
            }
        }));

        const message = await waitForAndPopLatestMessage(ws1Messages);
        expect(message.type).toBe("movement-rejected")
        expect(message.payload.x).toBe(adminX)
        expect(message.payload.y).toBe(adminY)
    })
    test("User should not be able to move two blocks at same time", async () => {
        ws1.send(JSON.stringify({
            type: "movement",
            payload: {
                x: adminX + 2,
                y: adminY
            }
        }));

        const message = await waitForAndPopLatestMessage(ws1Messages);
        expect(message.type).toBe("movement-rejected")
        expect(message.payload.x).toBe(adminX)
        expect(message.payload.y).toBe(adminY)
    })
    test("Correct movement should be broadcasted to the other Sockets in the Room", async () => {
        ws1.send(JSON.stringify({
            type: "movement",
            payload: {
                x: adminX + 2,
                y: adminY,
                userID: adminId
            }
        }));

        const message = await waitForAndPopLatestMessage(ws2Messages);
        expect(message.type).toBe("movement")
        expect(message.payload.x).toBe(adminX + 1)
        expect(message.payload.y).toBe(adminY)
    })
    test("If a user leaves, the other user recives a leave Event", async () => {

        ws1.close()
        const message = await waitForAndPopLatestMessage(ws2Messages);
        expect(message.type).toBe("user-left")
        expect(message.payload.userID).toBe(adminId)
    })
})