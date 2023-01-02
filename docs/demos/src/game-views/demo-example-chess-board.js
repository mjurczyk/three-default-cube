import {
  ViewClass,
  AssetsService,
  RenderService,
  SceneService,
  CameraService,
  TimeService,
  MathService,
} from 'three-default-cube';
import boardModel from '../assets/models/example-chess-board.glb';
import boardHdri from '../assets/hdri/spaichingen_hill_1k.hdr';
import Chess from 'chess.js';

const getBoardPosition = (file = 1, rank = 1) => {
  return [
    -3.5 + (file - 1),
    0.0,
    3.5 - (rank - 1)
  ];
};

const fileToNumber = (file) => [ 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h' ].indexOf(file) + 1;

let sampleGameId = Math.floor(Math.random() * 3);

const getSampleGame = () =>  {
  sampleGameId = (sampleGameId + 1) % 3;

  return [
    `1.e4 e6 2.d4 d5 3.Nd2 c5 4.exd5 Qxd5 5.Ngf3 cxd4 6.Bc4 Qd6 7.O-O Nf6 8.Nb3 Nc6
    9.Nbxd4 Nxd4 10.Nxd4 a6 11.Nf3 b5 12.Bd3 Bb7 13.a4 Ng4 14.Re1 Qb6 15.Qe2 Bc5
    16.Rf1 b4 17.h3 Nf6 18.Bg5 Nh5 19.Be3 Bxe3 20.Qxe3 Qxe3 21.fxe3 Ng3 22.Rfe1 Ne4
    23.Ne5 Nc5 24.Bc4 Ke7 25.a5 Rhd8 26.Red1 Rac8 27.b3 Rc7 28.Rxd8 Kxd8 29.Nd3 Nxd3
    30.Bxd3 Rc5 31.Ra4 Kc7 32.Kf2 g6 33.g4 Bc6 34.Rxb4 Rxa5 35.Rf4 f5 36.g5 Rd5
    37.Rh4 Rd7 38.Bxa6 Rd2+ 39.Ke1 Rxc2 40.Rxh7+ Kd6 41.Bc4 Bd5 42.Rg7 Rh2 43.Rxg6 Rxh3
    44.Kd2 Rg3 45.Rg8 Bxc4 46.bxc4 Kc5 47.g6 Kd6 48.c5+ Kc7 49.g7 Kb7 50.c6+  1-0`,
    `1.e4 e5 2.Nf3 Nf6 3.Nxe5 d6 4.Nf3 Nxe4 5.Nc3 Nxc3 6.dxc3 Be7 7.Be3 O-O 8.Bd3 Nd7
    9.Qe2 b6 10.O-O-O Bb7 11.Nd4 Bf6 12.h4 Nc5 13.Bb5 a6 14.Bc6 Bxd4 15.cxd4 Bxc6
    16.dxc5 bxc5 17.Bxc5 Re8 18.Qg4 Qc8 19.Qxc8 Raxc8 20.Bd4 Re4 21.f3 Re2 22.Rd2 Rce8
    23.Rhd1 f6 24.b3 Kf7 25.c4 Bd7 26.Kc2 Bf5+ 27.Kc3 h5 28.Bf2 R8e5 29.Rxe2 Rxe2
    30.Rd2 Rxd2 31.Kxd2 Ke6 32.Kc3 c5 33.b4 cxb4+ 34.Kxb4 Bb1 35.a3 Bd3 36.g3 g5
    37.f4 g4 38.Bd4 Kf5 39.c5 dxc5+ 40.Kxc5 Ke4 41.Bxf6 Kf3 42.f5 Kxg3 43.Kd4 Bxf5
    44.Ke3 Kg2 45.Be5 g3 46.Bb8 Bd7 47.Bc7 Be6 48.Bd6 Kh3 49.Be5 Kxh4 50.Kf3 Bd5+
    51.Kf4 Kh3  0-1`,
    `1.d4 Nf6 2.Nf3 e6 3.c3 c5 4.Bg5 h6 5.Bxf6 Qxf6 6.e4 cxd4 7.cxd4 Bb4+ 8.Nc3 O-O
    9.Rc1 Nc6 10.a3 Ba5 11.b4 Bb6 12.e5 Qd8 13.Ne4 d5 14.Nc5 f6 15.Be2 fxe5 16.dxe5 a5
    17.Qd2 axb4 18.axb4 Bc7 19.Nd3 Ne7 20.O-O Nf5 21.Rfe1 Bb6 22.Nc5 Qe7 23.Nd4 Nxd4
    24.Qxd4 Bd7 25.Bd3 Ra3 26.Bb1 Bb5 27.Qg4 Qf7 28.f3 Bd3 29.Bxd3 Rxd3 30.Kh1 Bxc5
    31.Rxc5 Qf5 32.h3 Rb3 33.Rb5 Qxg4 34.hxg4 Rf4 35.Rxb7 Rfxb4 36.Re7 Rb1 37.Rxb1 Rxb1+
    38.Kh2 Rb6 39.Kg3 Kf8 40.Rd7 Rb2 41.f4 Re2 42.Kf3 Re4 43.g3 g6 44.Rh7 Ra4
    45.Rxh6 Ra3+ 46.Kg2 Ra2+ 47.Kf3 Ra3+ 48.Kg2 Ra2+ 49.Kh3 Kg7 50.g5 d4 51.Kg4 d3
    52.Rh1 Rf2 53.Ra1 d2 54.Ra7+ Kf8 55.Rd7 Ke8 56.Rd6 Ke7 57.Kh3 Kf7 58.Rd3 Ke7
    59.Rd4 Ke8 60.Rd6 Ke7 61.Kh4 Rh2+ 62.Kg4 Rf2 63.Kh3 Kf7 64.Rd7+ Ke8 65.Rd4 Ke7
    66.Kg4 Kf7 67.Kh3 Ke7 68.Kh4 Rh2+ 69.Kg4 Rf2 70.Kh3 Kf7 71.g4 Ke7 72.Kg3 Re2
    73.Kf3 Rh2 74.Ke3 Rg2 75.Kf3 Rh2 76.Rd6  1-0`
  ][sampleGameId];
};

export class DemoChessBoardView extends ViewClass {
  onCreate() {
    const scene = RenderService.getScene();

    const ambientLight = AssetsService.getAmbientLight(0xffffcc, 0xffffff, .5);
    scene.add(ambientLight);

    AssetsService.getHDRI(boardHdri).then(hdri => {
      SceneService.setEnvironment(hdri);
    });

    AssetsService.getModel(boardModel).then(model => {
      const pieces = { w: [], b: [] };

      SceneService.parseScene({
        target: model,
        gameObjects: {
          crown: (target) => {
            TimeService.registerFrameListener(() => {
              target.rotation.y += 0.005;
            });
          },
          piece: (target) => {
            const { initialPosition, piece } = target.userData;
            const [ file, rank ] = initialPosition.split('');
            const [ color, type, id ] = piece.split('');
            const fileInt = fileToNumber(file);
            const rankInt = parseFloat(rank);

            target.userData = {
              ...target.userData,
              color,
              type,
              id,
              position: initialPosition
            };
            
            target.position.set(...getBoardPosition(fileInt, rankInt));

            TimeService.registerFrameListener(() => {
              if (target.userData.position === null) {
                target.visible = false;
                return;
              }
              const [ file, rank ] = target.userData.position.split('');
              const fileInt = fileToNumber(file);
              const rankInt = parseFloat(rank);

              const targetPosition = MathService.getVec3();
              targetPosition.set(...getBoardPosition(fileInt, rankInt));

              target.position.lerp(targetPosition, 0.5);
              target.visible = true;

              MathService.releaseVec3(targetPosition);
            });

            pieces[color].push(target);
          },
          board: (target) => {
            let t = 0;

            TimeService.registerFrameListener(() => {
              target.rotation.x = Math.sin(t) * 0.025 - 0.05;
              target.rotation.y = Math.cos(t) * 0.025 - 0.05;

              t += 0.005;
            });
          }
        },
        onCreate: () => {
          CameraService.useCamera('board');

          let chessParser = new Chess();
          chessParser.load_pgn(getSampleGame());

          let history = chessParser.history({ verbose: true });
          let turn = 0;

          TimeService.registerIntervalListener(() => {
            if (turn === history.length - 1) {
              setTimeout(() => {
                pieces.w.forEach(piece => piece.userData.position = piece.userData.initialPosition);
                pieces.b.forEach(piece => piece.userData.position = piece.userData.initialPosition);

                chessParser.clear();
                chessParser.reset();
                chessParser.load_pgn(getSampleGame());

                history = chessParser.history({ verbose: true });
                turn = 0;
              }, 3000);
              
              turn = history.length;
            }

            if (!history[turn]) {
              return;
            }

            const { color, flags, from, to } = history[turn];

            const piece = pieces[color].find(({ userData }) => userData.position === from);

            piece.userData.position = to;

            if ([ 'e', 'c' ].includes(flags)) {
              const capturedPiece = pieces[color === 'w' ? 'b' : 'w'].find(({ userData }) => userData.position === to);

              capturedPiece.userData.position = null;
            } else if (flags === 'k') {
              if (color === 'w') {
                const rook = pieces[color].find(({ userData }) => userData.position === 'h1');

                rook.userData.position = 'f1';
              } else {
                const rook = pieces[color].find(({ userData }) => userData.position === 'h8');

                rook.userData.position = 'f8';
              }
            } else if (flags === 'q') {
              if (color === 'w') {
                const rook = pieces[color].find(({ userData }) => userData.position === 'a1');

                rook.userData.position = 'd1';
              } else {
                const rook = pieces[color].find(({ userData }) => userData.position === 'a8');

                rook.userData.position = 'd8';
              }
            }

            turn = Math.min(turn + 1, history.length);
          }, 500);

          scene.add(model);
        }
      });
    });
  }
}
