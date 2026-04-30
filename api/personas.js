import { personas } from '../src/prompts.js';

export default function handler(req, res) {
  res.status(200).json({ personas });
}
