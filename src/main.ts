import './styles/tokens.css';
import './styles/stage.css';
import './styles/scenes.css';
import './styles/presenter.css';
import { loadFonts } from './core/fonts';
import { installTextures } from './core/textures';

async function boot() {
  await loadFonts();
  if (location.hash.startsWith('#presenter')) {
    const { startPresenter } = await import('./presenter/presenter');
    startPresenter();
  } else {
    installTextures();
    const { startAudience } = await import('./audience');
    startAudience();
  }
}

void boot();
