# Instituto Brasileiro de Fotografia de Natureza

Aplicação web voltada a fotografia de natureza, birdwatching, expedições e formação. O projeto combina apresentação institucional, portfólio fotográfico e experiência interativa em uma interface moderna construída com Next.js e TypeScript.

## Visão geral

O sistema foi desenvolvido para apresentar o trabalho de fotografia de aves e natureza de forma mais rica do que uma landing page tradicional. A experiência reúne galeria, espécies, agenda, cursos, conteúdo editorial e integrações externas.

## Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- Lucide React
- Cheerio

## Funcionalidades

### Galeria de fotografia
- coleção de imagens e espécies;
- remoção de duplicidades na carga de dados;
- ordenação e organização de conteúdo fotográfico;
- integração com dados do WikiAves;
- carregamento paginado de fotografias.

### Lightbox avançado
- zoom por scroll;
- pinch-to-zoom;
- double tap;
- arraste da imagem ampliada;
- navegação anterior/próxima;
- controle de escala e posição.

### Conteúdo e experiência
- agenda de expedições fotográficas;
- cursos e formação;
- integração com Instagram, YouTube, WhatsApp e WikiAves;
- referências de imprensa;
- experiência responsiva;
- elementos visuais e SVGs customizados.

## Arquitetura atual

O projeto ainda concentra parte relevante da experiência em um componente de página extenso. A evolução recomendada é separar responsabilidades em módulos menores:

```text
app/
├── components/
│   ├── gallery/
│   ├── lightbox/
│   ├── expeditions/
│   ├── courses/
│   └── layout/
├── services/
│   └── wikiaves/
└── page.tsx
```

## Execução local

```bash
git clone https://github.com/c-o-s-m-o/Ibfn-Instituto_Brasileiro_de_Fotografia_de_Natureza.git
cd Ibfn-Instituto_Brasileiro_de_Fotografia_de_Natureza
yarn install
yarn dev
```

## Pontos de engenharia demonstrados

- React hooks e gerenciamento de estado de interface;
- manipulação de eventos de mouse e touch;
- consumo e normalização de conteúdo externo;
- modelagem com TypeScript;
- responsividade;
- interação multimodal em galeria;
- composição de experiência visual orientada a conteúdo.

## Evolução planejada

- extrair serviços externos para uma camada própria;
- dividir o componente principal;
- adicionar testes para galeria e lightbox;
- revisar dependências de proxy externo;
- adicionar screenshots e vídeo curto de demonstração;
- documentar deploy e variáveis de ambiente, se aplicável.

## Autor

**Emanuel Cosmo**
