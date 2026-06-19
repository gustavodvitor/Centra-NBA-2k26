/**
 * A API balldontlie (camada gratuita) NÃO retorna fotos dos jogadores —
 * apenas nome, time, posição etc. Por isso, este arquivo é um mapa manual
 * e opcional: você pode colar aqui a URL de uma foto para os jogadores que
 * quiser exibir com imagem real. Os jogadores que não estiverem no mapa
 * (ou cuja imagem falhar ao carregar) continuam usando o avatar com
 * iniciais, que já é o padrão do app.
 *
 * De onde tirar uma URL de imagem com licença livre para reuso:
 * 1. Acesse https://commons.wikimedia.org
 * 2. Pesquise o nome do jogador
 * 3. Abra a foto desejada, clique em "Use this file" (ou no botão de
 *    download) e copie o link direto da imagem (termina em .jpg/.png)
 *
 * A chave do mapa é o "id" do jogador retornado pela API balldontlie
 * (não o nome). Para descobrir o id de um jogador: abra o DevTools do
 * navegador (F12) na página de detalhes dele e veja a URL da requisição
 * /api/players/:id, ou adicione um console.log(player.id) temporário
 * dentro do PlayerCard.jsx.
 *
 * Exemplo (substitua pela URL real que você encontrar):
 * export const playerPhotos = {
 *   237: "https://upload.wikimedia.org/wikipedia/commons/.../foto.jpg",
 * };
 */
export const playerPhotos = {
  // adicione aqui: <id_do_jogador>: "<url_da_foto>",
};

export function getPlayerPhoto(playerId) {
  return playerPhotos[playerId] || null;
}
