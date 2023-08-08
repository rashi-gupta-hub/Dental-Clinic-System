var express = require("express"),
    mongoose = require("mongoose"),
    passport = require("passport"),
    bodyParser = require("body-parser"),
    LocalStrategy = require("passport-local"),
    passportLocalMongoose =
    require("passport-local-mongoose");
var app = express();
const path = require('path')
const session = require('express-session');
const flash = require('connect-flash');
var Schema = mongoose.Schema;
var methodOverride = require('method-override');
const {
    string
} = require("joi");
app.use(express.static(path.join(__dirname, 'public')))
app.use(methodOverride('_method'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
    extended: true
}));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))
app.use(require("express-session")({
    secret: "Rusty is a dog",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
//var mongoDB = 'mongodb://127.0.0.1/path-system';
var mongoDB='mongodb+srv://Rashigupta:Rashi123@cluster0.zrpu3ec.mongodb.net/dental_clinic?retryWrites=true&w=majority';
mongoose.connect(mongoDB, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
var appointmentSchema = new Schema({
    phonenumber: String,
    name: String,
    age: Number,
    content: String,
    a_date: String,
    time: String,
    user_id: String,
    bookingStatus: String,
    doctor_id: String
});
var doctorSchema = new Schema({
    doctor_id: String,
    doctor_name: String,
    Qualification: String,
    phonenumber: String,
    experience: Number,
    email: String,
    password: String,
    appointment: [appointmentSchema]
})
var reviewSchema = new Schema({
    review: String,
    name: String
})
var Review = mongoose.model("Review", reviewSchema);
var Appointment = mongoose.model("Appointment", appointmentSchema);
var userschema = new Schema({
    username: String,
    password: String,
    email: String,
    appointment: [appointmentSchema]
});

userschema.plugin(passportLocalMongoose);

var User = mongoose.model('User', userschema);
var Doctor = mongoose.model('Doctor', doctorSchema);
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//Home page route
app.get('/', (req, res) => {
    Review.find({}, function(err, data) {
        if (err) {
            console.log(err);
            res.render('login');
        } else {
            console.log(data);
            res.render('homepage', {
                data: data
            });
        }
    });
});
// DOCTOR ROUTES
app.delete('/removeDoctor/:id', function(req, res) {
    Doctor.findByIdAndDelete(req.params.id.trim(), function(err, data) {
        if (err) {
            console.log(err);
            res.redirect('/');
        } else {
            res.redirect('/adminHome');
        }
    })
})
app.get('/loginDoctor', (req, res) => {
    res.render('loginDoctor', {
        message: req.flash('err')
    });
})
app.post('/loginDoctor', function(req, res) {
    Doctor.find({
        "email": req.body.email
    }, function(err, data) {
        if (data.length != 0) {
            if (data[0].password.trim() == req.body.password.trim()) {

                res.render('doctorHome', {
                    appointment: data[0].appointment,
                    doctorName: data[0].doctor_name
                });
            } else {

                res.redirect('/loginDoctor');
            }
        } else {
            res.redirect('/loginDoctor');
        }
    })
})

// doctor is closing the appointment
app.delete('/appointmentclose/:id', function(req, res) {
    const recievedId = req.params.id;
    Appointment.findById(req.params.id.trim(), function(zerr, appointmentdata) {
        if (zerr) {
            console.log(zerr);
            res.redirect('/');
        } else {
            var usersessionid = appointmentdata.user_id.trim();
            var doctorid = appointmentdata.doctor_id.trim();
            console.log("usersessionid-->", usersessionid);
            console.log("doctorid--->", doctorid);
            User.findById(usersessionid, function(err, foundUser) {
                if (err) {
                    console.log(err);
                    res.render('homepage');
                } else {


                    if (foundUser.appointment.length == 1) {

                        foundUser.appointment = [];
                        foundUser.save(function(err, sss) {
                            if (err) {
                                console.log(err);
                                res.redirect("/");
                            } else {

                                if (err) {
                                    console.log(err);
                                    res.redirect("/");
                                } else {

                                    Appointment.findById(req.params.id.trim(), function(aerr, appo) {
                                        if (aerr) {
                                            console.log(aerr);
                                            res.redirect('/');
                                        } else {
                                            Doctor.findById(appo.doctor_id.trim(), function(berr, docto) {
                                                if (berr) {
                                                    console.log(berr);
                                                    res.redirect('/');
                                                } else {

                                                    if (docto.appointment.length == 1) {

                                                        docto.appointment = [];
                                                        docto.save(function(cerr, ss) {
                                                            if (cerr) {
                                                                console.log(cerr);
                                                                res.redirect("/");
                                                            } else {
                                                                Doctor.findById(doctorid.trim(), function(err, data) {
                                                                    console.log("found doctor---->", data);
                                                                    if (true) {

                                                                        res.render('doctorHome', {
                                                                            appointment: data.appointment,
                                                                            doctorName: data.doctor_name
                                                                        });
                                                                    } else {

                                                                        res.redirect('/loginDoctor');
                                                                    }

                                                                })
                                                            }
                                                        });
                                                    } else {
                                                        for (let i = 0; i < docto.appointment.length; i++) {
                                                            if (docto.appointment[i].id.trim() === recievedId.trim() && i != docto.appointment.length - 1) {
                                                                docto.appointment.splice(i, 1);
                                                            }
                                                            if (i == docto.appointment.length - 1) {
                                                                if (docto.appointment[i].id.trim() === recievedId.trim()) {
                                                                    docto.appointment.pop();
                                                                }
                                                                docto.save(function(err, sss) {
                                                                    if (err) {
                                                                        console.log(err);
                                                                        res.redirect("/");
                                                                    } else {
                                                                        Doctor.findById(doctorid.trim(), function(err, data) {
                                                                            console.log("found doctor---->", data);
                                                                            if (true) {

                                                                                res.render('doctorHome', {
                                                                                    appointment: data.appointment,
                                                                                    doctorName: data.doctor_name
                                                                                });
                                                                            } else {

                                                                                res.redirect('/loginDoctor');
                                                                            }

                                                                        })
                                                                    }
                                                                });
                                                            }
                                                        }
                                                    }

                                                }
                                            })
                                        }
                                    })

                                }

                            }
                        });
                    } else {
                        for (let i = 0; i < foundUser.appointment.length; i++) {
                            if (foundUser.appointment[i].id.trim() === recievedId.trim() && i != foundUser.appointment.length - 1) {
                                foundUser.appointment.splice(i, 1);
                            }
                            if (i == foundUser.appointment.length - 1) {
                                if (foundUser.appointment[i].id.trim() === recievedId.trim()) {


                                    foundUser.appointment.pop();

                                }
                                foundUser.save(function(err, sss) {
                                    if (err) {
                                        console.log(err);
                                        res.redirect("/");
                                    } else {

                                        Appointment.findById(req.params.id.trim(), function(aerr, appo) {
                                            if (aerr) {
                                                console.log(aerr);
                                                res.redirect('/');
                                            } else {
                                                Doctor.findById(appo.doctor_id.trim(), function(berr, docto) {
                                                    if (berr) {
                                                        console.log(berr);
                                                        res.redirect('/');
                                                    } else {

                                                        if (docto.appointment.length == 1) {

                                                            docto.appointment = [];
                                                            docto.save(function(cerr, ss) {
                                                                if (cerr) {
                                                                    console.log(cerr);
                                                                    res.redirect("/");
                                                                } else {
                                                                    Doctor.findById(doctorid.trim(), function(err, data) {
                                                                        console.log("found doctor---->", data);
                                                                        if (true) {

                                                                            res.render('doctorHome', {
                                                                                appointment: data.appointment,
                                                                                doctorName: data.doctor_name
                                                                            });
                                                                        } else {

                                                                            res.redirect('/loginDoctor');
                                                                        }

                                                                    })
                                                                }
                                                            });
                                                        } else {
                                                            for (let i = 0; i < docto.appointment.length; i++) {
                                                                if (docto.appointment[i].id.trim() === recievedId.trim() && i != docto.appointment.length - 1) {
                                                                    docto.appointment.splice(i, 1);
                                                                }
                                                                if (i == docto.appointment.length - 1) {
                                                                    if (docto.appointment[i].id.trim() === recievedId.trim()) {
                                                                        docto.appointment.pop();
                                                                    }
                                                                    docto.save(function(err, sss) {
                                                                        if (err) {
                                                                            console.log(err);
                                                                            res.redirect("/");
                                                                        } else {
                                                                            Doctor.findById(doctorid.trim(), function(err, data) {
                                                                                console.log("found doctor---->", data);
                                                                                if (true) {

                                                                                    res.render('doctorHome', {
                                                                                        appointment: data.appointment,
                                                                                        doctorName: data.doctor_name
                                                                                    });
                                                                                } else {

                                                                                    res.redirect('/loginDoctor');
                                                                                }

                                                                            })
                                                                        }
                                                                    });
                                                                }
                                                            }
                                                        }

                                                    }
                                                })
                                            }
                                        })

                                    }
                                });
                            }
                        }
                    }
                }
            });


        }
    })


})
app.get('/registerDoctor', (req, res) => {

    res.render('registerDoctor', {
        message: req.flash('err')
    });
})
app.post("/registerDoctor", function(req, res) {
    var doctorInstance = new Doctor({
        doctor_name: req.body.doc_name,
        Qualification: req.body.doc_qualification,
        phonenumber: req.body.doc_num,
        experience: req.body.doc_exp,
        email: req.body.doc_email,
        password: req.body.password,
        appointment: []
    })
    doctorInstance.save(function(err, rrr) {
        if (err) {
            console.log(err);
            res.redirect('/');
        } else {
            console.log(rrr);
            User.find({}, function(err, data) {
                if (err) {
                    console.log(err);
                    res.redirect('/');
                } else {
                    console.log(data);
                    Doctor.find({}, function(aerr, docto) {
                        res.render('adminHome', {
                            data: data,
                            doctor_details: docto,
                            message: req.flash('success')
                        });
                    })

                }
            })
        }
    });


});
app.get('/userBookings/:id', function(req, res) {
    User.findById(req.params.id, function(err, data) {
        if (err) {
            console.log(err);
            res.render('homepage');
        } else {
            res.render('userBookings', {
                appointment: data.appointment,
                userName: data.username,
            });
        }
    })
})
// DOCTOR ROUTES
app.get('/adminHome', isLoggedIn, function(req, res) {
    User.find({}, function(err, data) {
        if (err) {
            console.log(err);
            res.redirect('/');
        } else {
            console.log(data);
            Doctor.find({}, function(aerr, docto) {
                res.render('adminHome', {
                    data: data,
                    doctor_details: docto,
                    message: req.flash('success')
                });
            })

        }
    })
});

app.get('/userHome', isLoggedIn, function(req, res) {
    var userID = req.user.id;
    User.findById(req.user.id, function(err, foundUser) {
        if (err) {
            console.log(err);
            res.render('homepage');
        } else if (foundUser.username.trim() == "admin") {
            res.redirect('/adminHome');

        } else {

            Doctor.find({}, function(err, data) {
                res.render('userHome', {
                    userId: userID,
                    userName: foundUser.username,
                    appointment: foundUser.appointment,
                    doctor_data: data
                });
            });



        }
    });

})

app.delete('/appointment/:id/:id2', function(req, res) {

    const userID = req.params.id2;
    const recievedId = req.params.id;
    // console.log(req.body.bookingstatus);
    User.findById(userID.trim(), function(err, foundUser) {
        if (err) {
            console.log(err);
            res.render('homepage');
        } else {


            if (foundUser.appointment.length == 1) {

                foundUser.appointment = [];
                foundUser.save(function(err, sss) {
                    if (err) {
                        console.log(err);
                        res.redirect("/");
                    } else {

                        if (err) {
                            console.log(err);
                            res.redirect("/");
                        } else {

                            Appointment.findById(req.params.id.trim(), function(aerr, appo) {
                                if (aerr) {
                                    console.log(aerr);
                                    res.redirect('/');
                                } else {
                                    Doctor.findById(appo.doctor_id.trim(), function(berr, docto) {
                                        if (berr) {
                                            console.log(berr);
                                            res.redirect('/');
                                        } else {
                                            if (docto == null) {
                                                res.redirect('/userHome');
                                            } else {

                                                if (docto.appointment.length == 1) {

                                                    docto.appointment = [];
                                                    docto.save(function(cerr, ss) {
                                                        if (cerr) {
                                                            console.log(cerr);
                                                            res.redirect("/");
                                                        } else {
                                                            console.log(ss);
                                                            res.redirect('/userHome')
                                                        }
                                                    });
                                                } else {
                                                    for (let i = 0; i < docto.appointment.length; i++) {
                                                        if (docto.appointment[i].id.trim() === recievedId.trim() && i != docto.appointment.length - 1) {
                                                            docto.appointment.splice(i, 1);
                                                        }
                                                        if (i == docto.appointment.length - 1) {
                                                            if (docto.appointment[i].id.trim() === recievedId.trim()) {
                                                                docto.appointment.pop();
                                                            }
                                                            docto.save(function(err, sss) {
                                                                if (err) {
                                                                    console.log(err);
                                                                    res.redirect("/");
                                                                } else {


                                                                    res.redirect('/userHome')
                                                                }
                                                            });
                                                        }
                                                    }
                                                }

                                            }

                                        }
                                    })
                                }
                            })

                        }

                    }
                });
            } else {
                for (let i = 0; i < foundUser.appointment.length; i++) {
                    if (foundUser.appointment[i].id.trim() === recievedId.trim() && i != foundUser.appointment.length - 1) {
                        foundUser.appointment.splice(i, 1);
                    }
                    if (i == foundUser.appointment.length - 1) {
                        if (foundUser.appointment[i].id.trim() === recievedId.trim()) {


                            foundUser.appointment.pop();

                        }
                        foundUser.save(function(err, sss) {
                            if (err) {
                                console.log(err);
                                res.redirect("/");
                            } else {

                                Appointment.findById(req.params.id.trim(), function(aerr, appo) {
                                    if (aerr) {
                                        console.log(aerr);
                                        res.redirect('/');
                                    } else {
                                        Doctor.findById(appo.doctor_id.trim(), function(berr, docto) {
                                            if (berr) {
                                                console.log(berr);
                                                res.redirect('/');
                                            } else {



                                                if (docto == null) {
                                                    res.redirect('/userHome');
                                                } else {

                                                    if (docto.appointment.length == 1) {

                                                        docto.appointment = [];
                                                        docto.save(function(cerr, ss) {
                                                            if (cerr) {
                                                                console.log(cerr);
                                                                res.redirect("/");
                                                            } else {
                                                                console.log(ss);
                                                                res.redirect('/userHome')
                                                            }
                                                        });
                                                    } else {
                                                        for (let i = 0; i < docto.appointment.length; i++) {
                                                            if (docto.appointment[i].id.trim() === recievedId.trim() && i != docto.appointment.length - 1) {
                                                                docto.appointment.splice(i, 1);
                                                            }
                                                            if (i == docto.appointment.length - 1) {
                                                                if (docto.appointment[i].id.trim() === recievedId.trim()) {
                                                                    docto.appointment.pop();
                                                                }
                                                                docto.save(function(err, sss) {
                                                                    if (err) {
                                                                        console.log(err);
                                                                        res.redirect("/");
                                                                    } else {


                                                                        res.redirect('/userHome')
                                                                    }
                                                                });
                                                            }
                                                        }
                                                    }

                                                }

                                            }
                                        })
                                    }
                                })

                            }
                        });
                    }
                }
            }
        }
    });

})
// user delets appointment
app.delete('/appointment/:id', function(req, res) {
    const recievedId = req.params.id;
    User.findById(req.user.id, function(err, foundUser) {
        if (err) {
            console.log(err);
            res.render('homepage');
        } else {


            if (foundUser.appointment.length == 1) {

                foundUser.appointment = [];
                foundUser.save(function(err, sss) {
                    if (err) {
                        console.log(err);
                        res.redirect("/");
                    } else {

                        if (err) {
                            console.log(err);
                            res.redirect("/");
                        } else {

                            Appointment.findById(req.params.id.trim(), function(aerr, appo) {
                                if (aerr) {
                                    console.log(aerr);
                                    res.redirect('/');
                                } else {
                                    Doctor.findById(appo.doctor_id.trim(), function(berr, docto) {
                                        if (berr) {
                                            console.log(berr);
                                            res.redirect('/');
                                        } else {

                                            if (docto == null) {
                                                res.redirect('/userHome');
                                            } else {

                                                if (docto.appointment.length == 1) {

                                                    docto.appointment = [];
                                                    docto.save(function(cerr, ss) {
                                                        if (cerr) {
                                                            console.log(cerr);
                                                            res.redirect("/");
                                                        } else {
                                                            console.log(ss);
                                                            res.redirect('/userHome')
                                                        }
                                                    });
                                                } else {
                                                    for (let i = 0; i < docto.appointment.length; i++) {
                                                        if (docto.appointment[i].id.trim() === recievedId.trim() && i != docto.appointment.length - 1) {
                                                            docto.appointment.splice(i, 1);
                                                        }
                                                        if (i == docto.appointment.length - 1) {
                                                            if (docto.appointment[i].id.trim() === recievedId.trim()) {
                                                                docto.appointment.pop();
                                                            }
                                                            docto.save(function(err, sss) {
                                                                if (err) {
                                                                    console.log(err);
                                                                    res.redirect("/");
                                                                } else {


                                                                    res.redirect('/userHome')
                                                                }
                                                            });
                                                        }
                                                    }
                                                }

                                            }

                                        }
                                    })
                                }
                            })

                        }

                    }
                });
            } else {
                for (let i = 0; i < foundUser.appointment.length; i++) {
                    if (foundUser.appointment[i].id.trim() === recievedId.trim() && i != foundUser.appointment.length - 1) {
                        foundUser.appointment.splice(i, 1);
                    }
                    if (i == foundUser.appointment.length - 1) {
                        if (foundUser.appointment[i].id.trim() === recievedId.trim()) {


                            foundUser.appointment.pop();

                        }
                        foundUser.save(function(err, sss) {
                            if (err) {
                                console.log(err);
                                res.redirect("/");
                            } else {

                                Appointment.findById(req.params.id.trim(), function(aerr, appo) {
                                    if (aerr) {
                                        console.log(aerr);
                                        res.redirect('/');
                                    } else {
                                        Doctor.findById(appo.doctor_id.trim(), function(berr, docto) {
                                            if (berr) {
                                                console.log(berr);
                                                res.redirect('/');
                                            } else {

                                                if (docto == null) {
                                                    res.redirect('/userHome');
                                                } else {
                                                    if (docto.appointment.length == 1) {

                                                        docto.appointment = [];
                                                        docto.save(function(cerr, ss) {
                                                            if (cerr) {
                                                                console.log(cerr);
                                                                res.redirect("/");
                                                            } else {
                                                                console.log(ss);
                                                                res.redirect('/userHome')
                                                            }
                                                        });
                                                    } else {
                                                        for (let i = 0; i < docto.appointment.length; i++) {
                                                            if (docto.appointment[i].id.trim() === recievedId.trim() && i != docto.appointment.length - 1) {
                                                                docto.appointment.splice(i, 1);
                                                            }
                                                            if (i == docto.appointment.length - 1) {
                                                                if (docto.appointment[i].id.trim() === recievedId.trim()) {
                                                                    docto.appointment.pop();
                                                                }
                                                                docto.save(function(err, sss) {
                                                                    if (err) {
                                                                        console.log(err);
                                                                        res.redirect("/");
                                                                    } else {


                                                                        res.redirect('/userHome')
                                                                    }
                                                                });
                                                            }
                                                        }
                                                    }

                                                }

                                            }
                                        })
                                    }
                                })

                            }
                        });
                    }
                }
            }
        }
    });


});
app.get('/login', (req, res) => {

    res.render('login', {
        message: req.flash('err')
    });
})
app.get('/loginflash', function(req, res) {
    req.flash('err', 'Inavlid username or password');
    res.redirect('/login');
})
app.post("/login", passport.authenticate("local", {
    successRedirect: "/userHome",
    failureRedirect: "/loginflash"
}), function(req, res) {

});
app.get('/register', (req, res) => {

    res.render('register', {
        message: req.flash('err')
    });
})
app.post("/register", function(req, res) {
    console.log(req.body.username);
    console.log(req.body.password);
    User.register(new User({
        username: req.body.username
    }), req.body.password, function(err, user) {
        if (err) {
            console.log(typeof(err));
            req.flash('err', "A user with given username already exists");
            console.log(err);
            res.redirect('/register');
        }
        passport.authenticate("local")(req, res, function() {
            console.log(req.user.id);
            res.redirect("/userHome");
        });
    });
});


app.get("/logout", function(req, res) {
    req.logout();
    res.redirect("/");
});
app.post('/review', function(req, res) {
    console.log("review route working");
    console.log(req.body.review);
    console.log(req.body.name);
    var reviewInstance = new Review({
        review: req.body.review,
        name: req.body.name
    })
    reviewInstance.save(function(err, rrr) {
        if (err) {
            console.log(err);
            res.redirect('/');
        } else {
            console.log(rrr);
            res.redirect('/');
        }
    });

});
app.post('/appointment/new', function(req, res) {
    // console.log("id in new appointment is--->");
    // console.log(req.body.doctor_id);
    User.findById(req.user.id, function(err, foundUser) {
        if (err) {
            console.log(err);
        } else {
            // console.log("date fprmat is-->")
            // console.log(req.body.date);


            // console.log(foundUser);
            Doctor.findById(req.body.doctor_id, function(aerr, foundDoctor) {
                if (aerr) {
                    console.log(aerr);
                    res.redirect('/');
                } else {
                    var ctc = new Appointment({
                        phonenumber: req.body.phnumber,
                        name: req.body.name,
                        age: req.body.age,
                        content: req.body.content,
                        a_date: req.body.date,
                        time: req.body.time,
                        user_id: req.user.id,
                        bookingStatus: "Booked",
                        doctor_id: req.body.doctor_id

                    });
                    ctc.save(function(err, ss) {
                        if (err) {
                            console.log(err);
                        } else {
                            foundUser.appointment.push(ss);
                            foundUser.save(function(err, sss) {
                                if (err) {
                                    console.log(err);
                                    res.redirect("/");
                                } else {
                                    foundDoctor.appointment.push(ss);
                                    foundDoctor.save(function(berr, ddata) {
                                        if (berr) {
                                            console.log(berr);
                                        } else {
                                            res.redirect('/userHome');
                                        }
                                    })

                                }
                            });


                        }
                    });
                }
            })

        }
    });
    // console.log("hi");

});

app.get('/swasth', function(req, res) {
    res.render('swasth')
});
app.get('/preventive', function(req, res) {
    res.render('preventive')
});
app.get('/elderly', function(req, res) {
    res.render('elderly')
});
app.get('/cosmetic', function(req, res) {
    res.render('cosmetic')
});

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect("/login");
}



app.listen(3000, () => {
    console.log("server started......");
});