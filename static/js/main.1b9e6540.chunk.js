(this["webpackJsonpgame-starter"]=this["webpackJsonpgame-starter"]||[]).push([[0],{20:function(e,t,r){e.exports=r.p+"static/media/character.e1ab850e.glb"},35:function(e,t,r){e.exports=r.p+"static/media/demo-basic.ed8ca940.glb"},52:function(e,t,r){e.exports=r.p+"static/media/example-chess-board.889371c7.glb"},53:function(e,t,r){e.exports=r.p+"static/media/spaichingen_hill_1k.dd7d9e20.hdr"},55:function(e,t,r){e.exports=r(97)},86:function(e,t,r){e.exports=r.p+"static/media/demo-actions-and-ui.6235c1a6.glb"},87:function(e,t,r){e.exports=r.p+"static/media/demo-game-objects.7e1b2b59.glb"},88:function(e,t,r){e.exports=r.p+"static/media/demo-persistence.146d3590.glb"},89:function(e,t,r){e.exports=r.p+"static/media/demo-physics.79823df6.glb"},90:function(e,t,r){e.exports=r.p+"static/media/demo-ui-alignment.3e84587d.glb"},92:function(e,t,r){e.exports=r.p+"static/media/spinner-default.9d266d9a.png"},93:function(e,t,r){e.exports=r.p+"static/media/font.3ed9575d.ttf"},94:function(e,t,r){e.exports=r.p+"static/media/intro.56f385dd.glb"},97:function(e,t,r){"use strict";r.r(t);var a=r(8),n=r.n(a),i=r(12),s=r(1),c=r(10),o=r(2),u=r(5),l=r(3),v=r(4),d=function(e){Object(l.a)(a,e);var t=Object(v.a)(a);function a(){return Object(o.a)(this,a),t.apply(this,arguments)}return Object(u.a)(a,[{key:"onCreate",value:function(){var e=Object(i.a)(n.a.mark((function e(){var t,a;return n.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:t=s.RenderService.getScene(),a=s.AssetsService.getAmbientLight(16777164,255,7),t.add(a),new s.Preloader({requireAssets:[s.AssetsService.getModel(r(35)),s.AssetsService.getModel(r(20))],onComplete:function(e){var r=Object(c.a)(e,2),a=r[0],n=r[1];s.SceneService.parseScene({target:a,navpath:1,gameObjects:{player:function(e){Object(s.replacePlaceholder)(e,n);var t=new s.AnimationWrapper(n);t.playAnimation("idle");var r=new s.PhysicsWrapper(e);r.enableNavmaps();var a=0;s.TimeService.registerFrameListener((function(){var n=s.InputService.keys.w,i=s.InputService.keys.s,c=s.InputService.keys.a,o=s.InputService.keys.d,u=s.MathService.getVec3(0,0,0);if(n&&(u.z-=1),i&&(u.z+=1),c&&(u.x-=1),o&&(u.x+=1),u.length()>0){a=s.MathUtils.lerp(a,.04,.2);var l=s.MathService.getVec3(0,0,0),v=s.UtilsService.getEmpty();e.getWorldPosition(l).sub(u),v.position.copy(e.position),v.quaternion.copy(e.quaternion),v.lookAt(l),e.quaternion.slerp(v.quaternion,.2),s.MathService.releaseVec3(l),s.UtilsService.releaseEmpty(v)}else a=s.MathUtils.lerp(a,0,.2);u.normalize().multiplyScalar(a),r.setSimpleVelocity(u),t.blendInAnimation("run",25*a),s.MathService.releaseVec3(u)}))}},onCreate:function(){s.CameraService.useCamera(s.CameraService.getCamera("initial"),!1),t.add(a)}})}});case 4:case"end":return e.stop()}}),e)})));return function(){return e.apply(this,arguments)}}()}]),a}(s.ViewClass),p=function(e){Object(l.a)(a,e);var t=Object(v.a)(a);function a(){return Object(o.a)(this,a),t.apply(this,arguments)}return Object(u.a)(a,[{key:"onCreate",value:function(){var e=Object(i.a)(n.a.mark((function e(){var t,a;return n.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:t=s.RenderService.getScene(),a=s.AssetsService.getAmbientLight(16777164,255,7),t.add(a),new s.Preloader({requireAssets:[s.AssetsService.getModel(r(35)),s.AssetsService.getModel(r(20))],onComplete:function(e){var r=Object(c.a)(e,2),a=r[0],n=r[1];s.SceneService.parseScene({target:a,navpath:1,gameObjects:{player:function(e){Object(s.replacePlaceholder)(e,n);var t=new s.AnimationWrapper(n);t.playAnimation("idle");var r=new s.PhysicsWrapper(e);r.enableNavmaps();var a=0;s.CameraService.follow(e),s.CameraService.followPivotPosition.set(0,2,2),s.TimeService.registerFrameListener((function(){var n=s.InputService.keys.w,i=s.InputService.keys.s,c=s.InputService.keys.a,o=s.InputService.keys.d;c&&(e.rotation.y-=.025),o&&(e.rotation.y+=.025),a=n?s.MathUtils.lerp(a,-.04,.2):i?s.MathUtils.lerp(a,.02,.2):s.MathUtils.lerp(a,0,.2);var u=s.MathService.getVec3();e.getWorldDirection(u),u.multiplyScalar(a),r.setSimpleVelocity(u),t.blendInAnimation("run",25*Math.abs(a)),s.MathService.releaseVec3(u)}))}},onCreate:function(){t.add(a)}})}});case 4:case"end":return e.stop()}}),e)})));return function(){return e.apply(this,arguments)}}()}]),a}(s.ViewClass),f=r(0),g=function(e){Object(l.a)(a,e);var t=Object(v.a)(a);function a(){return Object(o.a)(this,a),t.apply(this,arguments)}return Object(u.a)(a,[{key:"onCreate",value:function(){var e=Object(i.a)(n.a.mark((function e(){var t,a;return n.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:t=s.RenderService.getScene(),a=s.AssetsService.getAmbientLight(16777164,255,7),t.add(a),s.VarService.setVar("count",0),new s.Preloader({requireAssets:[s.AssetsService.getModel(r(86))],onComplete:function(e){var r=Object(c.a)(e,1)[0];s.SceneService.parseScene({target:r,actions:{increment:function(e){s.VarService.setVar("count",Math.min(s.VarService.getVar("count")+1,10)),e.material.emissiveIntensity=1,e.scale.setScalar(1.1)},decrement:function(e){s.VarService.setVar("count",Math.max(0,s.VarService.getVar("count")-1)),e.material.emissiveIntensity=1,e.scale.setScalar(1.1)}},gameObjects:{actionButton:function(e){var t=e.material;t.emissiveIntensity=0,t.emissive=new f.Color(16777164),s.TimeService.registerFrameListener((function(){t.emissiveIntensity=s.MathUtils.lerp(t.emissiveIntensity,0,.1);var r=s.MathService.getVec3(1,1,1);e.scale.lerp(r,.1),s.MathService.releaseVec3(r)}))}},onCreate:function(){s.CameraService.useCamera(s.CameraService.getCamera("initial"),!1),t.add(r)}})}});case 5:case"end":return e.stop()}}),e)})));return function(){return e.apply(this,arguments)}}()}]),a}(s.ViewClass),h=function(e){Object(l.a)(a,e);var t=Object(v.a)(a);function a(){return Object(o.a)(this,a),t.apply(this,arguments)}return Object(u.a)(a,[{key:"onCreate",value:function(){var e=Object(i.a)(n.a.mark((function e(){var t,a;return n.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:t=s.RenderService.getScene(),a=s.AssetsService.getAmbientLight(16777164,255,7),t.add(a),new s.Preloader({requireAssets:[s.AssetsService.preloadModel(r(20))],onComplete:function(){!function e(){s.AssetsService.getModel(r(20)).then((function(e){s.SceneService.parseScene({target:e,onCreate:function(){e.position.x=s.MathUtils.randFloat(-5,5),e.position.y-=1.5,e.position.z-=15+s.MathUtils.randFloat(0,10),e.rotation.y=s.MathUtils.randFloat(-s.mathPi4,s.mathPi4),t.add(e),setTimeout((function(){s.AssetsService.disposeAsset(e)}),3e3+500*Math.random())}})})),setTimeout((function(){e()}),1e3+500*Math.random())}()}});case 4:case"end":return e.stop()}}),e)})));return function(){return e.apply(this,arguments)}}()}]),a}(s.ViewClass),m=function(e){Object(l.a)(a,e);var t=Object(v.a)(a);function a(){return Object(o.a)(this,a),t.apply(this,arguments)}return Object(u.a)(a,[{key:"onCreate",value:function(){var e=Object(i.a)(n.a.mark((function e(){var t,a;return n.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:t=s.RenderService.getScene(),a=s.AssetsService.getAmbientLight(16777164,255,7),t.add(a),new s.Preloader({requireAssets:[s.AssetsService.getModel(r(87))],onComplete:function(e){var r=Object(c.a)(e,1)[0];s.SceneService.parseScene({target:r,gameObjects:{cubeRed:function(e){s.TimeService.registerFrameListener((function(t){var r=t.elapsedTime;e.rotation.x+=.1*Math.sin(r)}))},cubeGreen:function(e){s.TimeService.registerFrameListener((function(t){var r=t.elapsedTime;e.position.y=.5*Math.sin(r),e.rotation.x=-.4*Math.sin(r)}))},cubeBlue:function(e){s.TimeService.registerFrameListener((function(t){var r=t.elapsedTime,a=s.MathService.getVec3(1,1,1).multiplyScalar(.1*Math.sin(r)+1);e.scale.copy(a),s.MathService.releaseVec3(a)}))}},onCreate:function(){s.CameraService.useCamera(s.CameraService.getCamera("initial"),!1),t.add(r)}})}});case 4:case"end":return e.stop()}}),e)})));return function(){return e.apply(this,arguments)}}()}]),a}(s.ViewClass),S=function(e){Object(l.a)(a,e);var t=Object(v.a)(a);function a(){return Object(o.a)(this,a),t.apply(this,arguments)}return Object(u.a)(a,[{key:"onCreate",value:function(){var e=Object(i.a)(n.a.mark((function e(){var t,a;return n.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return t=s.RenderService.getScene(),a=s.AssetsService.getAmbientLight(16777164,255,7),t.add(a),e.next=5,s.VarService.registerPersistentVar("viewCount",0);case 5:s.VarService.setVar("viewCount",s.VarService.getVar("viewCount")+1),1===s.VarService.getVar("viewCount")?s.VarService.setVar("views","You saw this page 1 time"):s.VarService.getVar("viewCount")>1&&s.VarService.getVar("viewCount")<10?s.VarService.setVar("views","You saw this page ".concat(s.VarService.getVar("viewCount")," times")):s.VarService.setVar("views","You saw this page plenty of times"),new s.Preloader({spinnerTexture:s.GameInfoService.config.textures.spinner,requireAssets:[s.AssetsService.getModel(r(88))],onComplete:function(e){var r=Object(c.a)(e,1)[0];s.SceneService.parseScene({target:r,gameObjects:{},onCreate:function(){s.CameraService.useCamera(s.CameraService.getCamera("initial"),!1),t.add(r)}})}});case 8:case"end":return e.stop()}}),e)})));return function(){return e.apply(this,arguments)}}()}]),a}(s.ViewClass),b=function(){function e(t){Object(o.a)(this,e),this.target=null,this.snowCanvas=null,this.snowTexture=null,this.snowProps={textureSize:64,textureColor:"#999999",snowOffset:2,snowDisplacement:.1},this.target=t,this.onCreate()}return Object(u.a)(e,[{key:"onCreate",value:function(){this.target.material&&s.AssetsService.disposeProps(this.target.material),this.snowCanvas=document.createElement("canvas"),this.snowCanvas.width=this.snowProps.textureSize,this.snowCanvas.height=this.snowProps.textureSize;var e=this.snowCanvas.getContext("2d");e.fillStyle="#000000",e.fillRect(0,0,this.snowCanvas.width,this.snowCanvas.height),e.globalCompositeOperation="screen",this.snowTexture=new f.CanvasTexture(this.snowCanvas),s.AssetsService.registerDisposable(this.snowTexture),this.target.material=new f.MeshPhongMaterial({color:16777215,side:f.DoubleSide,displacementMap:this.snowTexture,displacementScale:-this.snowProps.snowDisplacement,metalness:.5,roughness:.5,emissive:new f.Color(16777215),emissiveIntensity:.3}),s.AssetsService.registerDisposable(this.target.material)}},{key:"onInteraction",value:function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},t=e.hit,r=t.uv,a=this.snowTexture.image;if(r&&a){this.snowTexture.transformUv(r);var n=a.getContext("2d"),i=r.x*this.snowProps.textureSize-this.snowProps.snowOffset/2,s=r.y*this.snowProps.textureSize-this.snowProps.snowOffset/2;n.fillStyle="#ffffff",n.fillRect(i,s,this.snowProps.snowOffset,this.snowProps.snowOffset),this.snowTexture.needsUpdate=!0}}},{key:"dispose",value:function(){this.target&&delete this.target,this.snowTexture&&delete this.snowTexture,delete this.snowCanvas,this.snowCanvas=null,delete this.snowProps}}]),e}(),w=function(e){Object(l.a)(a,e);var t=Object(v.a)(a);function a(){return Object(o.a)(this,a),t.apply(this,arguments)}return Object(u.a)(a,[{key:"onCreate",value:function(){var e=Object(i.a)(n.a.mark((function e(){var t,a;return n.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:t=s.RenderService.getScene(),a=s.AssetsService.getAmbientLight(16777164,255,7),t.add(a),s.PhysicsService.registerSurfaceHandler("snow",b,"onInteraction"),new s.Preloader({requireAssets:[s.AssetsService.getModel(r(89)),s.AssetsService.getModel(r(20))],onComplete:function(e){var r=Object(c.a)(e,2),a=r[0],n=r[1];s.SceneService.parseScene({target:a,gameObjects:{player:function(e){Object(s.replacePlaceholder)(e,n);var t=new s.AnimationWrapper(n);t.playAnimation("idle");var r=new s.PhysicsWrapper(e);r.enableNavmaps();var a=0;s.TimeService.registerFrameListener((function(){var n=s.InputService.keys.w,i=s.InputService.keys.s,c=s.InputService.keys.a,o=s.InputService.keys.d,u=s.MathService.getVec3(0,0,0);if(n&&(u.z-=1),i&&(u.z+=1),c&&(u.x-=1),o&&(u.x+=1),u.length()>0){a=s.MathUtils.lerp(a,.04,.2);var l=s.MathService.getVec3(0,0,0),v=s.UtilsService.getEmpty();e.getWorldPosition(l).sub(u),v.position.copy(e.position),v.quaternion.copy(e.quaternion),v.lookAt(l),e.quaternion.slerp(v.quaternion,.2),s.MathService.releaseVec3(l),s.UtilsService.releaseEmpty(v)}else a=s.MathUtils.lerp(a,0,.2);u.normalize().multiplyScalar(a),r.setSimpleVelocity(u),t.blendInAnimation("run",25*a),s.MathService.releaseVec3(u)}))}},onCreate:function(){s.CameraService.useCamera(s.CameraService.getCamera("initial"),!1),t.add(a)}})}});case 5:case"end":return e.stop()}}),e)})));return function(){return e.apply(this,arguments)}}()}]),a}(s.ViewClass),x=function(e){Object(l.a)(a,e);var t=Object(v.a)(a);function a(){return Object(o.a)(this,a),t.apply(this,arguments)}return Object(u.a)(a,[{key:"onCreate",value:function(){var e=Object(i.a)(n.a.mark((function e(){var t,a;return n.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:t=s.RenderService.getScene(),a=s.AssetsService.getAmbientLight(16777164,255,7),t.add(a),new s.Preloader({requireAssets:[s.AssetsService.getModel(r(35)),s.AssetsService.getModel(r(20))],onComplete:function(e){var r=Object(c.a)(e,2),a=r[0],n=r[1];s.SceneService.parseScene({target:a,navpath:2,gameObjects:{player:function(e){Object(s.replacePlaceholder)(e,n),new s.AnimationWrapper(n).playAnimation("run");var t=new s.PhysicsWrapper(e);t.enableNavmaps(),t.enableNoClip();var r=new s.AiWrapper(e);r.registerBehaviour((function(){r.hasTargetNode()&&r.getDistanceToTargetNode()<=.5&&r.setTargetNode(null),r.hasTargetNode()||0!==r.path.length||(r.setTargetNode(s.AiService.getAiNodeById(Object(s.getRandomElement)([1,2,3]))),r.findPathToTargetNode());var e=r.getTargetNode(),t=s.MathService.getVec3();return e.getWorldPosition(t),Object(s.createArrowHelper)(s.RenderService.getScene(),"target-position",new f.Vector3(0,2,0),t),s.MathService.releaseVec3(t),{targetNode:e}}));s.TimeService.registerFrameListener((function(){var a=r.getAiBehaviour().targetNode;if(a){var i=s.MathService.getVec3();a.getWorldPosition(i),i.y=e.position.y;var c=s.UtilsService.getEmpty();e.add(c),c.lookAt(i),n.quaternion.slerp(c.quaternion,.2);var o=s.MathService.getVec3();n.getWorldDirection(o),t.setSimpleVelocity(o.multiplyScalar(.04)),s.MathService.releaseVec3(i),s.MathService.releaseVec3(o),s.UtilsService.releaseEmpty(c)}}))}},onCreate:function(){s.CameraService.useCamera(s.CameraService.getCamera("initial"),!1),t.add(a)}})}});case 4:case"end":return e.stop()}}),e)})));return function(){return e.apply(this,arguments)}}()}]),a}(s.ViewClass),y=function(e){Object(l.a)(a,e);var t=Object(v.a)(a);function a(){return Object(o.a)(this,a),t.apply(this,arguments)}return Object(u.a)(a,[{key:"onCreate",value:function(){var e=Object(i.a)(n.a.mark((function e(){var t,a;return n.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:t=s.RenderService.getScene(),a=s.AssetsService.getAmbientLight(16777164,255,7),t.add(a),s.TimeService.registerIntervalListener((function(){s.VarService.setVar("variable-x","".concat(100*Math.random(),"%")),s.VarService.setVar("variable-y","".concat(100*Math.random(),"%"))}),3e3),new s.Preloader({requireAssets:[s.AssetsService.getModel(r(90))],onComplete:function(e){var t=Object(c.a)(e,1)[0];s.UiService.registerUiElement(t);var r=s.AssetsService.getAmbientLight(16777164,255,5);s.UiService.uiScene.add(r),t.position.z-=6,s.SceneService.parseScene({target:t,gameObjects:{marker:function(e){s.AnimationService.registerAnimation({target:e,onCreate:function(e){var t=e.target;t.userData.rotation=t.rotation.clone()},onStep:function(e){var t=e.target,r=e.animationTime;t.rotation.z=t.rotation.z-.001*Math.cos(r)}})}},onCreate:function(){}})}});case 5:case"end":return e.stop()}}),e)})));return function(){return e.apply(this,arguments)}}()}]),a}(s.ViewClass),O=r(37),R=r(36),C=r(52),j=r.n(C),A=r(53),V=r.n(A),M=r(54),B=r.n(M),K=function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:1,t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:1;return[e-1-3.5,0,3.5-(t-1)]},D=function(e){return["a","b","c","d","e","f","g","h"].indexOf(e)+1},N=Math.floor(3*Math.random()),P=function(){return["1.e4 e6 2.d4 d5 3.Nd2 c5 4.exd5 Qxd5 5.Ngf3 cxd4 6.Bc4 Qd6 7.O-O Nf6 8.Nb3 Nc6\n9.Nbxd4 Nxd4 10.Nxd4 a6 11.Nf3 b5 12.Bd3 Bb7 13.a4 Ng4 14.Re1 Qb6 15.Qe2 Bc5\n16.Rf1 b4 17.h3 Nf6 18.Bg5 Nh5 19.Be3 Bxe3 20.Qxe3 Qxe3 21.fxe3 Ng3 22.Rfe1 Ne4\n23.Ne5 Nc5 24.Bc4 Ke7 25.a5 Rhd8 26.Red1 Rac8 27.b3 Rc7 28.Rxd8 Kxd8 29.Nd3 Nxd3\n30.Bxd3 Rc5 31.Ra4 Kc7 32.Kf2 g6 33.g4 Bc6 34.Rxb4 Rxa5 35.Rf4 f5 36.g5 Rd5\n37.Rh4 Rd7 38.Bxa6 Rd2+ 39.Ke1 Rxc2 40.Rxh7+ Kd6 41.Bc4 Bd5 42.Rg7 Rh2 43.Rxg6 Rxh3\n44.Kd2 Rg3 45.Rg8 Bxc4 46.bxc4 Kc5 47.g6 Kd6 48.c5+ Kc7 49.g7 Kb7 50.c6+  1-0","1.e4 e5 2.Nf3 Nf6 3.Nxe5 d6 4.Nf3 Nxe4 5.Nc3 Nxc3 6.dxc3 Be7 7.Be3 O-O 8.Bd3 Nd7\n    9.Qe2 b6 10.O-O-O Bb7 11.Nd4 Bf6 12.h4 Nc5 13.Bb5 a6 14.Bc6 Bxd4 15.cxd4 Bxc6\n    16.dxc5 bxc5 17.Bxc5 Re8 18.Qg4 Qc8 19.Qxc8 Raxc8 20.Bd4 Re4 21.f3 Re2 22.Rd2 Rce8\n    23.Rhd1 f6 24.b3 Kf7 25.c4 Bd7 26.Kc2 Bf5+ 27.Kc3 h5 28.Bf2 R8e5 29.Rxe2 Rxe2\n    30.Rd2 Rxd2 31.Kxd2 Ke6 32.Kc3 c5 33.b4 cxb4+ 34.Kxb4 Bb1 35.a3 Bd3 36.g3 g5\n    37.f4 g4 38.Bd4 Kf5 39.c5 dxc5+ 40.Kxc5 Ke4 41.Bxf6 Kf3 42.f5 Kxg3 43.Kd4 Bxf5\n    44.Ke3 Kg2 45.Be5 g3 46.Bb8 Bd7 47.Bc7 Be6 48.Bd6 Kh3 49.Be5 Kxh4 50.Kf3 Bd5+\n    51.Kf4 Kh3  0-1","1.d4 Nf6 2.Nf3 e6 3.c3 c5 4.Bg5 h6 5.Bxf6 Qxf6 6.e4 cxd4 7.cxd4 Bb4+ 8.Nc3 O-O\n    9.Rc1 Nc6 10.a3 Ba5 11.b4 Bb6 12.e5 Qd8 13.Ne4 d5 14.Nc5 f6 15.Be2 fxe5 16.dxe5 a5\n    17.Qd2 axb4 18.axb4 Bc7 19.Nd3 Ne7 20.O-O Nf5 21.Rfe1 Bb6 22.Nc5 Qe7 23.Nd4 Nxd4\n    24.Qxd4 Bd7 25.Bd3 Ra3 26.Bb1 Bb5 27.Qg4 Qf7 28.f3 Bd3 29.Bxd3 Rxd3 30.Kh1 Bxc5\n    31.Rxc5 Qf5 32.h3 Rb3 33.Rb5 Qxg4 34.hxg4 Rf4 35.Rxb7 Rfxb4 36.Re7 Rb1 37.Rxb1 Rxb1+\n    38.Kh2 Rb6 39.Kg3 Kf8 40.Rd7 Rb2 41.f4 Re2 42.Kf3 Re4 43.g3 g6 44.Rh7 Ra4\n    45.Rxh6 Ra3+ 46.Kg2 Ra2+ 47.Kf3 Ra3+ 48.Kg2 Ra2+ 49.Kh3 Kg7 50.g5 d4 51.Kg4 d3\n    52.Rh1 Rf2 53.Ra1 d2 54.Ra7+ Kf8 55.Rd7 Ke8 56.Rd6 Ke7 57.Kh3 Kf7 58.Rd3 Ke7\n    59.Rd4 Ke8 60.Rd6 Ke7 61.Kh4 Rh2+ 62.Kg4 Rf2 63.Kh3 Kf7 64.Rd7+ Ke8 65.Rd4 Ke7\n    66.Kg4 Kf7 67.Kh3 Ke7 68.Kh4 Rh2+ 69.Kg4 Rf2 70.Kh3 Kf7 71.g4 Ke7 72.Kg3 Re2\n    73.Kf3 Rh2 74.Ke3 Rg2 75.Kf3 Rh2 76.Rd6  1-0"][N=(N+1)%3]},T=function(e){Object(l.a)(r,e);var t=Object(v.a)(r);function r(){return Object(o.a)(this,r),t.apply(this,arguments)}return Object(u.a)(r,[{key:"onCreate",value:function(){var e=s.RenderService.getScene(),t=s.AssetsService.getAmbientLight(16777164,16777215,.5);e.add(t),s.AssetsService.getHDRI(V.a).then((function(e){s.SceneService.setEnvironment(e)})),s.AssetsService.getModel(j.a).then((function(t){var r={w:[],b:[]};s.SceneService.parseScene({target:t,gameObjects:{crown:function(e){s.TimeService.registerFrameListener((function(){e.rotation.y+=.005}))},piece:function(e){var t,a=e.userData,n=a.initialPosition,i=a.piece,o=n.split(""),u=Object(c.a)(o,2),l=u[0],v=u[1],d=i.split(""),p=Object(c.a)(d,3),f=p[0],g=p[1],h=p[2],m=D(l),S=parseFloat(v);e.userData=Object(R.a)(Object(R.a)({},e.userData),{},{color:f,type:g,id:h,position:n}),(t=e.position).set.apply(t,Object(O.a)(K(m,S))),s.TimeService.registerFrameListener((function(){if(null!==e.userData.position){var t=e.userData.position.split(""),r=Object(c.a)(t,2),a=r[0],n=r[1],i=D(a),o=parseFloat(n),u=s.MathService.getVec3();u.set.apply(u,Object(O.a)(K(i,o))),e.position.lerp(u,.5),e.visible=!0,s.MathService.releaseVec3(u)}else e.visible=!1})),r[f].push(e)},board:function(e){var t=0;s.TimeService.registerFrameListener((function(){e.rotation.x=.025*Math.sin(t)-.05,e.rotation.y=.025*Math.cos(t)-.05,t+=.005}))}},actions:{},onCreate:function(){s.CameraService.useCamera(s.CameraService.getCamera("board"),!0);var a=new B.a;a.load_pgn(P());var n=a.history({verbose:!0}),i=0;s.TimeService.registerIntervalListener((function(){if(i===n.length-1&&(setTimeout((function(){r.w.forEach((function(e){return e.userData.position=e.userData.initialPosition})),r.b.forEach((function(e){return e.userData.position=e.userData.initialPosition})),a.clear(),a.reset(),a.load_pgn(P()),n=a.history({verbose:!0}),i=0}),3e3),i=n.length),n[i]){var e=n[i],t=e.color,s=e.flags,c=e.from,o=(e.piece,e.to);if(r[t].find((function(e){return e.userData.position===c})).userData.position=o,["e","c"].includes(s))r["w"===t?"b":"w"].find((function(e){return e.userData.position===o})).userData.position=null;else if("k"===s){if("w"===t)r[t].find((function(e){return"h1"===e.userData.position})).userData.position="f1";else r[t].find((function(e){return"h8"===e.userData.position})).userData.position="f8"}else if("q"===s){if("w"===t)r[t].find((function(e){return"a1"===e.userData.position})).userData.position="d1";else r[t].find((function(e){return"a8"===e.userData.position})).userData.position="d8"}i=Math.min(i+1,n.length)}}),500),e.add(t)}})}))}}]),r}(s.ViewClass),k=Object.fromEntries(new URLSearchParams(window.location.search).entries()).demoId;s.DummyDebug.on(s.DebugFlags.DEBUG_ENABLE),"debugging"===k&&(s.DummyDebug.on(s.DebugFlags.DEBUG_LIVE),s.DummyDebug.on(s.DebugFlags.DEBUG_LOG_ASSETS),s.DummyDebug.on(s.DebugFlags.DEBUG_LOG_MEMORY),s.DummyDebug.on(s.DebugFlags.DEBUG_LOG_POOLS),s.DummyDebug.on(s.DebugFlags.DEBUG_STORAGE),s.DummyDebug.on(s.DebugFlags.DEBUG_TIME_LISTENERS)),s.GameInfoService.system(60,window.devicePixelRatio,!0,!0,0).camera(50,.1,1e3).texture("spinner",r(92)).font("default",r(93)).model("intro",r(94)),s.SystemService.init(),s.SystemService.onReady(Object(i.a)(n.a.mark((function e(){var t;return n.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:t=document.querySelector("#root"),s.RenderService.init({domElement:t}),s.RenderService.renderView({camera:new p,"views-and-scenes":new d,"actions-and-ui":new g,debugging:new h,"game-objects":new m,persistence:new S,physics:new w,ai:new x,"ui-alignment":new y,"example-chess-board":new T}[k]),s.RenderService.run();case 4:case"end":return e.stop()}}),e)}))))}},[[55,1,2]]]);
//# sourceMappingURL=main.1b9e6540.chunk.js.map