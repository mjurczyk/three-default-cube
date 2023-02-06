import { AiService } from "../services/ai-service";
import { AnimationService } from "../services/animation-service";
import { AssetsService } from "../services/assets-service";
import { AudioService } from "../services/audio-service";
import { CameraService } from "../services/camera-service";
import { InteractionsService } from "../services/interactions-service";
import { MathService } from "../services/math-service";
import { NetworkService } from "../services/network-service";
import { ParticleService } from "../services/particle-service";
import { PhysicsService } from "../services/physics-service";
import { RenderService } from "../services/render-service";
import { SceneService } from "../services/scene-service";
import { SpawnService } from "../services/spawn-service";
import { TimeService } from "../services/time-service";
import { UiService } from "../services/ui-service";
import { UtilsService } from "../services/utils-service";
import { VarService } from "../services/var-service";

export class ViewClass {
  onCreate() {}
  onDispose() {}

  dispose() {
    const scene = RenderService.getScene();

    scene.children.forEach(child => {
      AssetsService.registerDisposable(child);
    });

    this.onDispose();

    RenderService.resetPostProcessing();
    AiService.disposeAll();
    PhysicsService.disposeAll();
    CameraService.disposeAll();
    TimeService.disposeAll();
    AnimationService.disposeAll();
    InteractionsService.disposeListeners();
    VarService.disposeListeners();
    SceneService.disposeAll();
    UiService.disposeAll();
    ParticleService.disposeAll();
    AudioService.resetAudio();
    UtilsService.disposeAll();
    AssetsService.disposeAll();
    NetworkService.disposeAll();
    SpawnService.disposeAll();

    MathService.handleLeaks();
    MathService.disposeAll();
  }
}
