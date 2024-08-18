import { whiteBright, bgRed, bold } from 'colorette';
import detectPort from 'detect-port';

const port = process.env.PORT || '1212';

detectPort(port, (_err, availablePort) => {
  if (port !== String(availablePort)) {
    throw new Error(
      whiteBright(
        bgRed(
          bold(
            `Port "${port}" on "localhost" is already in use. Please use another port. ex: PORT=4343 npm start`,
          ),
        ),
      ),
    );
  } else {
    process.exit(0);
  }
});
