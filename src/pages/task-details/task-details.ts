import { Component, ViewChild } from "@angular/core";
import {
  AlertController,
  IonicPage,
  NavController,
  NavParams,
} from "ionic-angular";
import { Leadd, Leadref } from "../../models/user";

import firebase, { database, firestore } from "firebase/app";
import { Storage } from "@ionic/storage";

import { AngularFirestore } from "@angular/fire/firestore";
import { AngularFireAuth } from "@angular/fire/auth";

import { uuid } from "uuidv4";
import { Observable } from "rxjs";
import * as $ from "jquery";
import { Slides } from "ionic-angular";

interface Lead {
  status: string;
  action: string;
}
interface Task {
  status: string;
  action: string;
  remark: string;
  datetime: string;
}

@Component({
  selector: "page-task-details",
  templateUrl: "task-details.html",
})
export class TaskDetailsPage {
  @ViewChild(Slides) slides: Slides;
  slideOpts;
  public hideMe: boolean = false;
  public hideMe1: boolean = false;
  myDate;
  value: any;
  id: any;
  cid: any;
  data: any;
  data1: any;
  arr: any = [];
  leadId;
  act;
  select;
  count;
  //refid:any;
  pendings: any = [];
  leadref = {} as Leadref;
  task = {} as Task;
  leadd = {} as Leadd;
  showTasks;
  showSlide = false;
  public products: Observable<Lead[]>;
  currentuser = firebase.auth().currentUser;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public afs: AngularFirestore,
    private storage: Storage,
    private auth: AngularFireAuth,
    public alertCtrl: AlertController
  ) {
    // this.value = navParams.get('cid');
    // console.log(this.value);

    this.cid = navParams.get("cid");
    console.log(this.cid);

    this.data = navParams.get("data");
    console.log("Data", this.data);
    this.leadId=this.data.uid

    this.slideOpts = {
      effect: "flip",
    };

    let currentuser = firebase.auth().currentUser;
    firebase
      .firestore()
      .collection("Company")
      .doc(currentuser.photoURL + "/" + "Campaigns" + "/" + this.cid)
      .onSnapshot((doc) => {
        var source = doc.metadata.hasPendingWrites ? "Local" : "Server";
        console.log(source, " data: ");
        this.products = doc.data().status;
        this.arr = this.products;
        console.log(this.products);
      });
  }

  ionViewDidLoad() {
    let allTasks = [];
    let t = [];
    let f = [];
    firebase.firestore().collection("Company").doc(this.currentuser.photoURL).collection("Campaigns").doc(this.cid).get().then(doc =>{
      this.count = doc.data().pendings
      
    })

    firebase
      .firestore()
      .collection("Company")
      .doc(this.currentuser.photoURL)
      .collection("Campaigns")
      .doc(this.cid)
      .collection("leads")
      .doc(this.data.uid)
      .collection("History")
      .doc("Activity1")
      .get()
      .then((doc) => {
        if (doc.exists) {
          this.showTasks = true;
          allTasks = doc.data().data;
          for (var i in allTasks) {
            if (allTasks[i].Completed == true) {
              t.push(allTasks[i].id);
            } else {
              f.push(allTasks[i]);
            }
          }
          for (var c in f) {
            let is = t.includes(f[c].id);
            switch (is) {
              case true:
                break;
              case false:
                this.pendings.push(f[c]);
               
                break;
            }
          }
          console.log("ALL",this.pendings)
        } else {
          this.showTasks = false;
        }
      });

    
  }
  slideToSlide() {
    if (this.slides.getActiveIndex() + 1 === this.slides.length()) {
      this.slides.slideTo(0);
    } else {
      this.slides.lockSwipeToNext(false);
      this.slides.slideTo(this.slides.getActiveIndex() + 1);
      this.slides.lockSwipeToNext(false);
    }
  }

  slideToPrev() {
    if (this.slides.getActiveIndex() + 1 == this.slides.length()) {
      this.slides.lockSwipeToPrev(false);
      this.slides.slideTo(this.slides.getActiveIndex() - 1);
      this.slides.lockSwipeToPrev(false);
    }
  }

  completeTask(val) {
    console.log("Val", val);
    let currentuser = firebase.auth().currentUser;
    firebase
      .firestore()
      .collection("Company")
      .doc(
        currentuser.photoURL +
          "/" +
          "Campaigns" +
          "/" +
          this.cid +
          "/" +
          "leads" +
          "/" +
          this.leadId
      )
      .collection("History")
      .doc("Activity1")
      .update({
        data: firestore.FieldValue.arrayUnion({
          Time: new Date(),
          Action: val.Action,
          FollowUp: val.FollowUp,
          Remark: val.Remark,
          Status:val.Status,
          Handler: val.Handler,
          id: val.id,
          Completed: true,
        }),
      });

      var b = new Date().getMonth() + 1;

      var c = new Date().getFullYear();
      var a = new Date().getDate();

      let date = a + "-" + b + "-" + c;
      let dat = "";
      dat = date;
      console.log("Dateee", date);


      firebase
      .firestore()
      .collection("Company")
      .doc(currentuser.photoURL)
      .collection("Admin")
      .doc(currentuser.uid)
      .collection("Report")
      .doc(dat)
      .set(
        {
          data: firebase.firestore.FieldValue.arrayUnion({
            Time: new Date(),
            Action: val.Action,
            FollowUp: val.FollowUp,
            Remark: val.Remark,
            name:this.leadId,
            id:val.id
          }),
        },
        { merge: true }
      );

  }

  Getselected(selected_value) {
    let temp = [];

    console.log("SELECT", selected_value);
    this.select = selected_value;
    let action;
    for (var s in this.arr) {
      if (this.arr[s].status == selected_value) {
        temp.push(this.arr[s]);
        action = this.arr[s].action;
      }
    }
    this.act = action;
    console.log("TEMO", this.act);
    if (this.act === "Remove client from profile") {
      alert("this will remove this lead profile permently");
    }
  }

  Task(task: Task) {
    console.log("SR name", this.data.SR_name);
    let s = uuid();
    let u = s.split("-");
    let id = u[0];
    if (task.action && task.remark != null) {
      this.storage.get("cuid").then((val) => {
        console.log("id is", val);
        let uid = uuid();
        console.log(uid);
        let currentuser = firebase.auth().currentUser;

        firebase
          .firestore()
          .collection("Company")
          .doc(
            currentuser.photoURL +
              "/" +
              "Campaigns" +
              "/" +
              this.cid +
              "/" +
              "leads" +
              "/" +
              this.data.uid
          )
          .update(
            Object.assign(
              {
                //id: uid,
                action: task.action,
                datetime: task.datetime,
                status: task.status,
                remark: task.remark,
              },
              { merge: true }
            )
          );
        console.log("ACT IS ", this.act);
        console.log("SELECT", this.select);7
        

        firebase.firestore().collection("Company").doc(currentuser.photoURL).collection("Campaigns").doc(this.cid).collection("leads").doc(this.leadId).get().then(doc => {
          if(doc.data().pending = true){
            doc.ref.update({
              pending:false
            })

            firebase.firestore().collection("Company").doc(currentuser.photoURL).collection("Campaigns").doc(this.cid).update({
              pendings:this.count-1
            })


          }else{
           console.log("not false")

          }
        })


        switch (this.act) {
          case "Inform Manager":
            firebase
              .firestore()
              .collection("Company")
              .doc(
                currentuser.photoURL +
                  "/" +
                  "Campaigns" +
                  "/" +
                  this.cid +
                  "/" +
                  "leads messages" +
                  "/" +
                  this.data.uid
              )
              .set(
                Object.assign({
                  id: this.data.uid,
                  message:
                    "status upated to " +
                    this.select +
                    " " +
                    "by" +
                    " " +
                    currentuser.displayName,
                })
              );
            break;
          case "Remove client from profile":
            firebase
              .firestore()
              .collection("Company")
              .doc(
                currentuser.photoURL +
                  "/" +
                  "Campaigns" +
                  "/" +
                  this.cid +
                  "/" +
                  "leads" +
                  "/" +
                  this.data.uid
              )
              .delete();
            console.log("DELETED", this.data.uid);
            break;
        }

        firebase
          .firestore()
          .collection("Company")
          .doc(currentuser.photoURL)
          .collection("Campaigns")
          .doc(this.cid)
          .collection("leads")
          .doc(this.data.uid)
          .collection("History")
          .doc("Activity1")
          .set(
            {
              data: firebase.firestore.FieldValue.arrayUnion({
                Time: new Date(),
                Action: task.action,
                FollowUp: task.datetime,
                Remark: task.remark,
                Status:task.status,
                Handler: this.data.SR_name,
                Completed: false,
                id: id,
              }),
            },
            { merge: true }
          );
        var b = new Date().getMonth() + 1;

        var c = new Date().getFullYear();
        var a = new Date().getDate();

        let date = a + "-" + b + "-" + c;
        let dat = "";
        dat = date;
        console.log("Dateee", date);

        firebase
          .firestore()
          .collection("Company")
          .doc(currentuser.photoURL)
          .collection("Admin")
          .doc(currentuser.uid)
          .collection("Report")
          .doc(dat)
          .set(
            {
              data: firebase.firestore.FieldValue.arrayUnion({
                Time: new Date(),
                Action: task.action,
                FollowUp: task.datetime,
                Remark: task.remark,
                name: this.leadId,
                 id: id,
              }),
            },
            { merge: true }
          );

        let alert = this.alertCtrl.create({
          title: "Success",
          subTitle: "Saved Successfully",
          //scope: id,
          buttons: [
            {
              text: "OK",
              handler: (data) => {
                this.navCtrl.pop();
              },
            },
          ],
        });
        alert.present();
      });
    } else {
      let alert = this.alertCtrl.create({
        title: "Warning",
        subTitle: "Please Insert Data",
        //scope: id,
        buttons: [
          {
            text: "OK",
            handler: (data) => {
              //this.navCtrl.push(LoginPage);
            },
          },
        ],
      });
      alert.present();
    }
  }

  Save(leadref: Leadref) {
    if (
      leadref.email &&
      leadref.first_name &&
      leadref.last_name &&
      leadref.phone != null
    ) {
      this.storage.get("cuid").then((val) => {
        console.log("id is", val);
        let uid = uuid();
        console.log(uid);
        let currentuser = firebase.auth().currentUser;

        firebase
          .firestore()
          .collection("Company")
          .doc(
            currentuser.photoURL +
              "/" +
              "Campaigns" +
              "/" +
              this.cid +
              "/" +
              "Lead references" +
              "/" +
              uid
          )
          .set(
            Object.assign({
              id: uid,
              first_name: leadref.first_name,
              last_name: leadref.last_name,
              email: leadref.email,
              phone: leadref.phone,
              refId: this.data.uid,
            })
          );

        let alert = this.alertCtrl.create({
          title: "Success",
          subTitle: "Saved Successfully",
          //scope: id,
          buttons: [
            {
              text: "OK",
              handler: (data) => {
                //this.navCtrl.push(UserDetailsPage);
              },
            },
          ],
        });
        alert.present();
      });
    } else {
      let alert = this.alertCtrl.create({
        title: "Warning",
        subTitle: "Please Insert Data",
        //scope: id,
        buttons: [
          {
            text: "OK",
            handler: (data) => {
              //this.navCtrl.push(LoginPage);
            },
          },
        ],
      });
      alert.present();
    }
  }

  hide() {
    this.hideMe = true;
  }
  hide1() {
    this.hideMe1 = !this.hideMe1;
  }
  StartTask() {
    this.navCtrl.pop();
  }
  change(datePicker) {
    console.log("date", this.myDate);
    console.log("datePicker", datePicker);
    datePicker.open();
  }
  ab() {
    console.log("date");
  }
}
