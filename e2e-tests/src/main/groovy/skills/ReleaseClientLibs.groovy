package skills

class ReleaseClientLibs {

    static void main(String[] args) {
        new ReleaseClientLibs().doRelease()
    }

    TitlePrinter titlePrinter = new TitlePrinter()
    void doRelease(){
        titlePrinter.printTitle("Identify Dependencies")
        List<NpmProj> npmProjList = new NpmProjBuilder(includeSkillsServiceFrontend: true).build()
    }

    Map<NpmProj, NpmProj> buildRelMap(List<NpmProj> list){

    }
}
